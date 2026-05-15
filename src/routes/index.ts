import { evlog, type EvlogVariables } from "evlog/hono";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";

import { env } from "../env";
import webhooks from "./webhooks";

const api = new Hono<EvlogVariables>();
api.use(evlog());
api.use(bearerAuth({ token: env.API_TOKEN }));
api.route("/webhooks", webhooks);

export default api;
