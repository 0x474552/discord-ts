import type { Interaction, GuildMember } from 'discord.js';
import type { BotClient, BotEvent } from '../types';
import { checkPermissions } from '../types';
import { log } from '../utils/logger';

const event: BotEvent = {
  name: 'interactionCreate',
  once: false,
  async execute(...args: unknown[]) {
    const interaction = args[0] as Interaction;
    const client = args[1] as BotClient;

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands?.get(interaction.commandName);

    if (!command) {
      await interaction.reply({
        content: 'This command is no longer available.',
        ephemeral: true,
      });
      return;
    }

    /* ── Permission check ─────────────────────────────────── */
    const member = interaction.member as GuildMember | null;
    if (command.permissions && !checkPermissions(member, command.permissions)) {
      await interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true,
      });
      return;
    }

    /* ── Execute ──────────────────────────────────────────── */
    try {
      await command.execute(interaction, client);
    } catch (err) {
      log.error(`Command "${interaction.commandName}": ${(err as Error).message}`, 'commands');

      const reply = interaction.replied || interaction.deferred
        ? interaction.followUp.bind(interaction)
        : interaction.reply.bind(interaction);

      await reply({
        content: 'An error occurred while executing this command.',
        ephemeral: true,
      });
    }
  },
};

export default event;