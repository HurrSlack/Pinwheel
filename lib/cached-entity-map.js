class CachedEntityMap {
  constructor({ type, retrieve }) {
    this._type = type;
    this._retrieve = retrieve;
    if (!CachedEntityMap.maps.has(type)) {
      this._map = new Map();
      CachedEntityMap.maps.set(type, this._map);
    } else {
      this._map = CachedEntityMap.maps.get(type);
    }
  }
  async byId(id) {
    if (!this._map.has(id)) {
      await (this._populating || this._populate());
    }
    if (!this._map.has(id)) {
      throw new Error(`Could not find ${this._type} with id ${id}`);
    }
    return this._map.get(id);
  }
  async get(id, prop) {
    const response = await this.byId(id);
    return response[prop];
  }
  async _populate() {
    this._populating = this._retrieve();
    try {
      const entityList = await this._populating;
      for (const entity of entityList) {
        this._map.set(entity.id, entity);
      }
    } catch (e) {
      throw new Error(
        `Could not populate ${
          this._type
        } list. API error: ${require("util").inspect(e)}`
      );
    } finally {
      this._populating = null;
    }
  }
}

CachedEntityMap.maps = new Map();

module.exports = CachedEntityMap;
