// All must inherit.
class BasePoastHandler {
  constructor(globalConfig, payload, client, directory, logger) {
    this.globalConfig = globalConfig;
    this.payload = payload;
    this.client = client;
    this.directory = directory;
    this.logger = logger;
  }
}

module.exports = BasePoastHandler;
