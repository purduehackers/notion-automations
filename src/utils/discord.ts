import { WebhookClient, EmbedBuilder, Colors } from "discord.js";

export async function send({ url, embed }: { url: string; embed: EmbedBuilder }) {
  const webhook = new WebhookClient({ url });

  const sendable = embed.setColor(Colors.White).setAuthor({
    name: "Notion",
    iconURL:
      "https://cdn.discordapp.com/avatars/1428091409629450450/4a99c2d80c99d2327c8cb32bce2f0881.webp",
  });

  await webhook.send({ embeds: [sendable] });
}
