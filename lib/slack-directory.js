const CachedEntityMap = require("./cached-entity-map");

class SlackDirectory {
  constructor(client, { token }) {
    this.client = client;
    this.token = token;
    this.channels = new CachedEntityMap({
      type: "channel",
      retrieve: () => this.getChannelList(),
    });
    // this.users = new CachedEntityMap({
    //   type: "user",
    //   retrieve: () => this.getUserList(),
    // });
  }
  // not currently used
  // async getUserList() {
  //   const response = await this.client.users.list({ token: this.token });
  //   return response.members;
  // }
  async getChannelList() {
    const response = await this.client.conversations.list({
      token: this.token,
      exclude_archived: true,
      types: "public_channel",
    });
    return response.channels;
  }
}

module.exports = SlackDirectory;
