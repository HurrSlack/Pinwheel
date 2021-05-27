function poastKey(poast) {
  return poast.type + "_" + poast.slack_id;
}

/**
 * Just for testing, does not persist between server instances.
 */
class InMemoryConnector {
  constructor() {
    this.data = new Map();
  }
  async connect() {}
  async disconnect() {}
  async load(descriptor) {
    return this.data.get(poastKey(descriptor)) || descriptor;
  }
  async save(poast) {
    this.data.set(poastKey(poast), poast);
  }
}

module.exports = InMemoryConnector;
