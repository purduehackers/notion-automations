import { Notion } from "notion-schemas";
import * as z from "zod";

export function webhookSchema<T extends z.ZodType>(properties: T) {
	const schema = z.object({
		source: z.object({
			type: z.literal("automation"),
			automation_id: z.string(),
			action_id: z.string(),
			event_id: z.string(),
			attempt: z.number(),
		}),
		data: Notion.Page<T>(properties),
	});

	return schema;
}
