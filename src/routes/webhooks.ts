import { zValidator as validator } from "@hono/zod-validator";
import { Colors, EmbedBuilder, WebhookClient } from "discord.js";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { Notion } from "notion-schemas";
import * as z from "zod";
import { env } from "../env.js";
import { webhookSchema } from "../utils/notion.js";

const webhook = new WebhookClient({ url: env.DISCORD_MICROGRANTS_WEBHOOK_URL });

const route = new Hono();
route.use("/*", bearerAuth({ token: env.WEBHOOK_API_KEY }));

route.post(
	"/intake-form-notify-discord",
	makeValidator(
		z.looseObject({
			Description: Notion.prop.rich_text,
			Name: Notion.prop.rich_text,
			"Applicant Names": Notion.prop.rich_text,
			"Discord Usernames": Notion.prop.rich_text,
			"Requested Amount": Notion.prop.number,
		}),
	),
	async (c) => {
		const { source, data } = c.req.valid("json");

		console.log(
			`Received webhook from ${source.type} with ID ${source.automation_id}`,
		);

		// Normalize Values
		const name = formatRichText(data.properties.Name);
		const description = formatRichText(data.properties.Description);
		const _discordUsernames = formatRichText(
			data.properties["Discord Usernames"],
		);
		const applicantNames = formatRichText(data.properties["Applicant Names"]);
		const requestedAmount = data.properties["Requested Amount"].number;

		// Create Discord Embed
		const embed = new EmbedBuilder()
			.setTitle("New Microgrant Application")
			.setDescription(`**${name}**\n${description}`)
			.setFooter({ text: `https://www.notion.so/purduehackers/${data.id}` })
			.setFields([
				{
					name: "Applicant Name(s)",
					value: applicantNames,
				},
				{
					name: "Budget",
					value: `$${requestedAmount}`,
				},
			])
			.setColor(Colors.White);

		// Send Discord Embed
		try {
			await webhook.send({
				embeds: [embed],
			});
		} catch (error: any) {
			console.error(error);
			return c.json({ success: false, error: error.message }, 500);
		}

		return c.json({ success: true, message: "Webhook received" });
	},
);

function makeValidator<T extends z.ZodType>(schema: T) {
	return validator("json", webhookSchema(schema), (result, c) => {
		if (!result.success) {
			console.info("Validation error:", result.error);
			return c.json({ success: false, error: result.error }, 400);
		}
	});
}

function formatRichText(
	property: z.infer<typeof Notion.prop.rich_text>,
): string {
	return property.rich_text.map((text) => text.plain_text).join(" ");
}

export { route };
