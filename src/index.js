/*
import { DurableObject } from "cloudflare:workers";

export class MyDurableObject extends DurableObject {
	constructor(ctx, env) {
		super(ctx, env);
	}

	async sayHello(name) {
		return `Hello, ${name}!`;
	}
}

export default {
	async fetch(request, env, ctx) {
		const id = env.MY_DURABLE_OBJECT.idFromName("foo");
		const stub = env.MY_DURABLE_OBJECT.get(id);
		const greeting = await stub.sayHello("world");
		return new Response(greeting);
	},
};
*/
// index.js
import { DurableObject } from "cloudflare:workers";
import { Nodes } from "./nodes.js";

export class MyDurableObject extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.nodes = Nodes();
  }

  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === "/checkin") {
      const name = url.searchParams.get("name");
      if (!name) {
        return new Response(JSON.stringify({ error: 'Missing "name" parameter' }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      this.nodes.checkin(name);
      return new Response(JSON.stringify({ message: `Node "${name}" checked in.` }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (pathname === "/nodes") {
      const data = this.nodes.available();
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }
}

// Worker entry point
export default {
  async fetch(request, env, ctx) {
    const id = env.MY_DURABLE_OBJECT.idFromName("singleton");
    const stub = env.MY_DURABLE_OBJECT.get(id);
    return stub.fetch(request);
  },
};

