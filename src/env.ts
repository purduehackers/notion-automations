import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    API_TOKEN: z.string(),
    DISCORD_HIRING_WEBHOOK_URL: z.string(),
    DISCORD_MICROGRANTS_WEBHOOK_URL: z.string(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
