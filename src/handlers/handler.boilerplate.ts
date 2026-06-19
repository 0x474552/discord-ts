import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';

/**
 * Reference helper for extracting repeated interaction logic into a handler.
 * This file is not wired into the starter runtime by default.
 */
export async function replyWithBoilerplateMessage(
  interaction: ChatInputCommandInteraction,
  content: string,
): Promise<void> {
  await interaction.reply({
    content,
    flags: MessageFlags.Ephemeral,
  });
}
