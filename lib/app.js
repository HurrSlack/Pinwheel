const { App: SlackApp, LogLevel } = require("@slack/bolt");
const { TwitterClient } = require("twitter-api-client");
const createDbConnector = require("./db-connector");
const SlackDirectory = require("./slack-directory");

module.exports = async function createApp(config, env = process.env) {
  const isProd = env.NODE_ENV === "production";

  // Initializes your app with your bot token and signing secret
  const slack = new SlackApp({
    ...config.slack,
    logLevel: isProd ? LogLevel.INFO : LogLevel.DEBUG,
  });

  slack.error((e) =>
    console.error("Unhandled exception!", require("util").inspect(e))
  );

  const directory = new SlackDirectory(slack.client, config.slack);

  const dbConnector = createDbConnector(config.db);
  slack.dbConnector = dbConnector;

  async function onlyPinReacts({ payload, next }) {
    if (payload.reaction === config.reacji.toTriggerTweet) {
      await next();
    }
  }

  async function withPoastHandler({ context, payload, client, logger, next }) {
    let PoastHandler;
    try {
      PoastHandler = require(`./poast-handlers/poast-${payload.item.type}`);
    } catch (e) {
      logger.error(
        `Failed to find a way to make a poast out of unknown type "${payload.item.type}". ${e.message}`
      );
      return;
    }
    context.poastHandler = new PoastHandler(
      config,
      payload,
      client,
      directory,
      logger
    );
    await next();
  }

  slack.event(
    "reaction_added",
    onlyPinReacts,
    withPoastHandler,
    async function doTweetMessageText({ context, logger }) {
      const { poastHandler } = context;
      await dbConnector.connect();
      const poast = await dbConnector.load(poastHandler.getPoastDescriptor());
      if (poast.tweet_id) {
        logger.warn(
          `Poast "${poast.slack_id}" was already tweeted! https://twitter.com/twitter/status/${poast.tweet_id}`
        );
      } else if (poast.forbidden) {
        logger.warn(
          `Poast ${poast.slack_id} cannot be tweeted, is poast forbidden`
        );
      } else {
        let tweetId;
        try {
          tweetId = await poastHandler.sendTweet(
            new TwitterClient(config.twitter)
          );
        } catch (e) {
          logger.error(
            new Error(
              `Could not tweet message ${JSON.stringify(poast)}: ${e.message}`
            ).stack
          );
        }
        if (tweetId) {
          poast.tweet_id = tweetId;
          try {
            await dbConnector.save(poast);
            logger.info("Poast stored", poast);
          } catch (e) {
            logger.error(
              `Could not store tweet ${poast.tweet_id} for poast ${poast.slack_id}: ${e.stack}`
            );
          }
        }
        await dbConnector.disconnect();
      }
    }
  );

  slack.event(
    "reaction_removed",
    onlyPinReacts,
    withPoastHandler,
    async function doRemvoePoast({ context, logger }) {
      const { poastHandler } = context;
      const reactions = await poastHandler.getPinReactions();
      if (reactions) {
        logger.info("Still has pin reacts left. Will not untweet yet.");
        return;
      }
      logger.info(
        `After latest removal: ${JSON.stringify(
          poastHandler.getPoastDescriptor()
        )} has 0 pin reacts. Should untweet.`
      );
      await dbConnector.connect();
      const poast = await dbConnector.load(poastHandler.getPoastDescriptor());
      if (!poast.tweet_id) {
        logger.warn(
          `Poast "${poast.slack_id}" does not have a tweet associated. It must have not successfully twote when pinned.`
        );
        return;
      }
      logger.info(
        "Running twitter.tweets.statusesDestroyById with",
        poast.tweet_id
      );
      const twitter = new TwitterClient(config.twitter);
      await twitter.tweets.statusesDestroyById({ id: poast.tweet_id });
      logger.info("Untwote", poast);
      delete poast.tweet_id;
      await dbConnector.save(poast);
      await dbConnector.disconnect();
    }
  );

  return slack;
};
