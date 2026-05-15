import { zValidator as validator } from "@hono/zod-validator";
import type { EvlogVariables } from "evlog/hono";
import type { Context } from "hono";
import type { BlankInput } from "hono/types";
import { Notion } from "notion-schemas";
import { z } from "zod";

export function webhookSchema<T extends z.ZodType>(properties: T) {
  return z.object({
    source: z.object({
      type: z.literal("automation"),
      automation_id: z.string(),
      action_id: z.string(),
      event_id: z.string(),
      attempt: z.number(),
    }),
    data: Notion.Page<T>(properties),
  });
}

export function makeValidator<T extends z.ZodType>(schema: T) {
  // @ts-expect-error: Context type is not correctly inferred by the validator
  return validator("json", webhookSchema(schema), (result, c: Context<EvlogVariables, string, BlankInput>) => {
    if (!result.success) {
      const log = c.get("log");

      log.set({ parsed_data: result.data })
      log.error(result.error);

      return c.json({ success: false, error: result.error }, 400);
    }
  });
}
