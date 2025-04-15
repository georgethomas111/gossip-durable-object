// gossip.js
export class Gossip {
  /**
   * Create a Gossip instance.
   * @param {string[]} [peerUrls=[]] - List of peer URLs.
   */
  constructor(peerUrls = []) {
    this.peerUrls = peerUrls;
    this.store = {};
  }

  /**
   * Set a key with a given value locally and broadcast the update.
   * @param {string} key - Key to set.
   * @param {*} value - Value to store.
   * @returns {Promise<void>}
   */
  async set(key, value) {
    this.store[key] = value;
    await this.broadcast(key, value);
  }

  /**
   * Get the value for a specific key.
   * @param {string} key - Key to retrieve.
   * @returns {*} The stored value.
   */
  get(key) {
    return this.store[key];
  }

  /**
   * Broadcasts the key–value pair to each peer.
   * Each peer is assumed to expose a "/gossip" endpoint.
   * @param {string} key - The key being updated.
   * @param {*} value - The new value.
   * @returns {Promise<void>}
   */
  async broadcast(key, value) {
    const payload = { key, value };
    const requests = this.peerUrls.map((url) =>
      fetch(`${url}/gossip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
    await Promise.all(requests);
  }

  /**
   * Receives an update from another node and updates the local store.
   * @param {string} key - The key to update.
   * @param {*} value - The new value.
   */
  receiveUpdate(key, value) {
    this.store[key] = value;
  }
}
