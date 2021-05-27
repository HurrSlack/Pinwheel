require("dotenv").config();
const camelspace = require("camelspace");
const createApp = require("./app");

async function main() {
  const app = await createApp(
    camelspace.of(["slack", "twitter", "reacji", "db"]),
    process.env
  );
  // Start your app
  const server = await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
  return server;
}

module.exports = main;

if (module === require.main) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
