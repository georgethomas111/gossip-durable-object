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
