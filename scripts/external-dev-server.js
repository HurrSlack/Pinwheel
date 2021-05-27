require("dotenv").config();

const serveApp = require("../lib/server");
const ngrok = require("ngrok");
const camelspace = require("camelspace");

async function startDevServer() {
  const server = await serveApp();
  const url = await ngrok.connect({
    ...camelspace("ngrok").fromEnv(process.env),
    port: server.address().port,
  });

  console.log("External dev server running at %s", url);
}

startDevServer().catch((e) => {
  console.error(e);
  process.exit(1);
});
