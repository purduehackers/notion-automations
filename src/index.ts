import { Hono } from "hono";
import { logger } from "hono/logger";

import { route as webhooks } from "./routes/webhooks.js";

const app = new Hono();
app.use(logger());

app.get("/", (c) => {
	return c.text("yummy docs ₍^. .^₎⟆");
});

app.route("/webhooks", webhooks);

export default app;
