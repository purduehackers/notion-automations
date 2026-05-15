import { Notion } from "notion-schemas";
import { z } from "zod";

export function formatRichText(property: z.infer<typeof Notion.prop.rich_text>): string {
  return property.rich_text.map((text) => text.plain_text).join(" ");
}
