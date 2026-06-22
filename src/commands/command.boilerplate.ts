import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types';
import { buildEmbed } from '../utils/embed';

/**
 * Use this file as template when creating a new command.
 * Then register the new command inside src/commands/index.ts.
 */
const commandBoilerplate: BotCommand = {
  // "commands.categories.<category>" in config.json.
  category: 'user', // user | staff | developer | etc.

  // Indicated in config.json
  // "permissions.levels.<position>": {
  //     "user": 0,
  //     "staff": 1,
  //     "admin": 2,
  //     "developer": 3,
  //     "NEW_POSITION": 4
  //   }
  // Note: You can add more custom positions linking them to a respective ID

  // since 2 is set, it means that guild member requires the role declared as "guild.roles.admin" in config.json
  permissionLevel: 2,
  permissionMode: 'config',
  // Available modes:
  // - 'config' for integer levels from config.json
  // - 'discord' for native Discord permission flags
  // - 'both' to require both checks

  data: new SlashCommandBuilder()
    .setName('boilerplate')
    .setDescription('An example of a command description.'),
  async execute(interaction) {
    await interaction.reply({
      embeds: [buildEmbed('info').setDescription('Example command response.')],
      // using MessageFlags instead of deprecated 'ephemeral: true'
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default commandBoilerplate;
