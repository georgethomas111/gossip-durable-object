// Import the original Nodes functionality and the Gossip library.
import { DurableObject } from "cloudflare:workers";
import { Nodes } from "./nodes.js";
import { Gossip } from "./gossip.js";

export class MyDurableObject extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    // Original nodes functionality.
    this.nodes = Nodes();
    // Initialize gossip store.
    this.gossip = new Gossip([]);
  }

  async fetch(request) {
    const url = new URL(request.url);
    return this.routeRequest(url, request);
  }

  // Routes the request to the appropriate endpoint handler.
  async routeRequest(url, request) {
    const pathname = url.pathname;
    switch (true) {
      case pathname === "/":
        return this.handleIndex();
      case pathname === "/checkin":
        return this.handleCheckin(url);
      case pathname === "/nodes":
        return this.handleNodes();
      case pathname.startsWith("/gossip/"):
        return this.routeGossip(url, request);
      default:
        return new Response("Not found", { status: 404 });
    }
  }

  // Returns an index (list) of available endpoints.
  async handleIndex() {
    const index = {
      endpoints: {
        "/": "List available endpoints",
        "/checkin?name=NAME": "Check in a node with the specified name.",
        "/nodes": "List currently available nodes.",
        "/gossip/set?key=KEY&value=VALUE": "Set a key in the gossip store.",
        "/gossip/get?key=KEY": "Get the value for a key from the gossip store.",
        "/gossip/update (POST)": "Receive a gossip update. JSON payload: { key, value }",
        "/gossip/store": "Get the entire gossip store."
      }
    };
    return new Response(JSON.stringify(index, null, 2), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // Handles /checkin endpoint.
  async handleCheckin(url) {
    const name = url.searchParams.get("name");
    if (!name) {
      return new Response(
        JSON.stringify({ error: 'Missing "name" parameter' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    this.nodes.checkin(name);
    return new Response(
      JSON.stringify({ message: `Node "${name}" checked in.` }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // Handles /nodes endpoint.
  async handleNodes() {
    const data = this.nodes.available();
    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // Routes all endpoints starting with /gossip/.
  async routeGossip(url, request) {
    const subRoute = url.pathname.slice("/gossip/".length);
    switch (subRoute) {
      case "set":
        return this.handleGossipSet(url);
      case "get":
        return this.handleGossipGet(url);
      case "update":
        return this.handleGossipUpdate(request);
      case "store":
        return this.handleGossipStore();
      default:
        return new Response("Gossip endpoint not found", { status: 404 });
    }
  }

  // Handles /gossip/set endpoint: expects query parameters key and value.
  async handleGossipSet(url) {
    const key = url.searchParams.get("key");
    const value = url.searchParams.get("value");
    if (!key) {
      return new Response(
        JSON.stringify({ error: 'Missing "key" parameter' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    await this.gossip.set(key, value);
    return new Response(
      JSON.stringify({ message: `Gossip: key "${key}" set to "${value}".` }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // Handles /gossip/get endpoint: expects a query parameter key.
  async handleGossipGet(url) {
    const key = url.searchParams.get("key");
    if (!key) {
      return new Response(
        JSON.stringify({ error: 'Missing "key" parameter' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const value = this.gossip.get(key);
    return new Response(
      JSON.stringify({ key, value }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // Handles /gossip/update endpoint: expects a POST with JSON payload { key, value }.
  async handleGossipUpdate(request) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!body.key || body.value === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing key or value in payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    this.gossip.receiveUpdate(body.key, body.value);
    return new Response(
      JSON.stringify({ message: "Gossip update received." }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // Handles /gossip/store endpoint: returns the entire gossip store.
  async handleGossipStore() {
    return new Response(
      JSON.stringify(this.gossip.store),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}

// Worker entry point.
export default {
  async fetch(request, env, ctx) {
    const id = env.MY_DURABLE_OBJECT.idFromName("singleton");
    const stub = env.MY_DURABLE_OBJECT.get(id);
    return stub.fetch(request);
  },
};

