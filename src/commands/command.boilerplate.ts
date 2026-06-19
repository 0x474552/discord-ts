import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types';
import { buildEmbed } from '../utils/embed';

/**
 * Use this file as template when creating a new command.
 * Then register the new command inside src/commands/index.ts.
 */
const commandBoilerplate: BotCommand = {
  category: 'user',
  permissionLevel: 0,
  permissionMode: 'config',
  data: new SlashCommandBuilder().setName('example').setDescription('Example command boilerplate.'),
  async execute(interaction) {
    await interaction.reply({
      embeds: [buildEmbed('info').setDescription('Example command response.')],
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default commandBoilerplate;
