import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		WEBHOOK_API_KEY: z.string().min(1),
		DISCORD_MICROGRANTS_WEBHOOK_URL: z.url().min(1),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
