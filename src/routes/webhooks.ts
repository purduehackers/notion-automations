import { EmbedBuilder } from "discord.js";
import { evlog, type EvlogVariables } from "evlog/hono";
import { Hono } from "hono";
import { Notion } from "notion-schemas";
import z from "zod";

import { env } from "../env";
import { send } from "../utils/discord";
import { formatRichText } from "../utils/notion";
import { makeValidator } from "../utils/validator";

const route = new Hono<EvlogVariables>();
route.use(evlog());

const HiringSchema = makeValidator(z.object({}));

route.post("/hiring", HiringSchema, async (c) => {
  const log = c.get("log");

  const { data, source } = c.req.valid("json");

  log.set({
    webhook_name: "hiring",
    automation_id: source.automation_id,
    action_id: source.action_id,
    event_id: source.event_id,
    attempt: source.attempt,
  });

  return c.json({ ok: true });
});

const MicrograntsSchema = makeValidator(
  z.object({
    Description: Notion.prop.rich_text,
    Name: Notion.prop.rich_text,
    "Applicant Names": Notion.prop.rich_text,
    "Discord Usernames": Notion.prop.rich_text,
    "Requested Amount": Notion.prop.number,
  }),
);

route.post("/microgrants", MicrograntsSchema, async (c) => {
  const log = c.get("log");

  const { data, source } = c.req.valid("json");

  log.set({
    webhook_name: "microgrants",
    automation_id: source.automation_id,
    action_id: source.action_id,
    event_id: source.event_id,
    attempt: source.attempt,
  });

  const name = formatRichText(data.properties.Name);
  const description = formatRichText(data.properties.Description);
  const discordUsernames = formatRichText(data.properties["Discord Usernames"]);
  const applicantNames = formatRichText(data.properties["Applicant Names"]);
  const requestedAmount = data.properties["Requested Amount"].number
    ? `$${data.properties["Requested Amount"].number}`
    : "Unspecified";

  log.set({
    name,
    description,
    discord_usernames: discordUsernames,
    applicant_names: applicantNames,
    requested_amount: requestedAmount,
  });

  const embed = new EmbedBuilder()
    .setTitle("New Microgrant Application")
    .setDescription(`**${name}**\n${description}`)
    .setFields([
      {
        name: "Applicant Name(s)",
        value: applicantNames,
      },
      {
        name: "Budget",
        value: requestedAmount,
      },
    ])
    .setFooter({ text: `https://www.notion.so/purduehackers/${data.id.replace("-", "")}` });

  await send({ url: env.DISCORD_MICROGRANTS_WEBHOOK_URL, embed });

  return c.json({ ok: true });
});

export default route;
