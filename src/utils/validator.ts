import { zValidator as validator } from "@hono/zod-validator";
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
  return validator("json", webhookSchema(schema), (result, c) => {
    if (!result.success) {
      console.info("Validation error:", result.error);
      return c.json({ success: false, error: result.error }, 400);
    }
  });
}
