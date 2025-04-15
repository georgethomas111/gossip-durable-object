// gossip.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Gossip } from './gossip';

// Mock the global fetch function for testing.
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
  })
);

describe('Gossip Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update the local store when setting a key', async () => {
    const gossip = new Gossip([]);
    await gossip.set('foo', 'bar');
    expect(gossip.get('foo')).toBe('bar');
  });

  it('should broadcast the update to all configured peers', async () => {
    const peerUrls = ['http://node1.example', 'http://node2.example'];
    const gossip = new Gossip(peerUrls);
    await gossip.set('foo', 'bar');

    // Verify fetch was called once per peer.
    expect(global.fetch).toHaveBeenCalledTimes(peerUrls.length);
    for (const url of peerUrls) {
      expect(global.fetch).toHaveBeenCalledWith(`${url}/gossip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'foo', value: 'bar' }),
      });
    }
  });

  it('should update the local store when receiveUpdate is called', () => {
    const gossip = new Gossip([]);
    gossip.receiveUpdate('hello', 'world');
    expect(gossip.get('hello')).toBe('world');
  });
});

