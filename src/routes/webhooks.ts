import { EmbedBuilder } from "discord.js";
import { evlog, type EvlogVariables } from "evlog/hono";
import { Hono } from "hono";
import { Notion } from "notion-schemas";
import z from "zod";

import { env } from "../env";
import { send } from "../utils/discord";
import { formatRichText } from "../utils/notion";
import { makeValidator } from "../utils/validator";

const router = new Hono<EvlogVariables>();
router.use(evlog());

const HiringSchema = makeValidator(
  z.object({
    "Preferred Name": Notion.prop.title,
    "Discord Username": Notion.prop.rich_text,
    Roles: Notion.prop.relation,
    "Tell us about yourself": Notion.prop.rich_text,
    Socials: Notion.prop.rich_text,
    "When is your expected graduation date?": Notion.prop.rich_text,
    "Time commitment": Notion.prop.multi_select,
    "How did you hear about this position?": Notion.prop.multi_select,
    "If you selected “Other”, where did you hear about this position?": Notion.prop.rich_text,
    "Have you been to Hack Night before?": Notion.prop.multi_select,
  }),
);

router.post("/hiring", HiringSchema, async (c) => {
  const log = c.get("log");

  const { data, source } = c.req.valid("json");

  log.set({
    webhook_name: "hiring",
    automation_id: source.automation_id,
    action_id: source.action_id,
    event_id: source.event_id,
    attempt: source.attempt,
  });

  const name = data.properties["Preferred Name"].title[0]!.text.content;
  const discord = formatRichText(data.properties["Discord Username"]);
  const roles = data.properties["Roles"].relation.map((role) => role.id);
  const about = formatRichText(data.properties["Tell us about yourself"]);
  const socials = formatRichText(data.properties["Socials"]);
  const graduation = formatRichText(data.properties["When is your expected graduation date?"]);
  const timeCommitment = data.properties["Time commitment"].multi_select[0]!.name === "Yes";
  const referrer = data.properties["How did you hear about this position?"].multi_select[0]!.name;
  const referrer_additional = formatRichText(
    data.properties["If you selected “Other”, where did you hear about this position?"],
  );
  const has_been_to_hack_night =
    data.properties["Have you been to Hack Night before?"].multi_select[0]!.name === "Yes";

  log.set({
    name,
    discord,
    roles,
    about,
    socials,
    graduation,
    timeCommitment,
    referrer,
    referrer_additional,
    has_been_to_hack_night,
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

router.post("/microgrants", MicrograntsSchema, async (c) => {
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
    .setFooter({ text: `https://www.notion.so/purduehackers/${data.id.replaceAll("-", "")}` });

  await send({ url: env.DISCORD_MICROGRANTS_WEBHOOK_URL, embed });

  return c.json({ ok: true });
});

export default router;
