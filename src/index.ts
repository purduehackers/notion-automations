import { initLogger } from "evlog";
import { evlog, type EvlogVariables } from "evlog/hono";
import { Hono } from "hono";

initLogger({
  env: { service: "notion-automations" },
});

import api from "./routes";

const app = new Hono<EvlogVariables>();
app.use(evlog());

app.get("/", async (c) => c.text("yummy docs ₍^. .^₎⟆"));

app.route("/api", api);

export default app;
