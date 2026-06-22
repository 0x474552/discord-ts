import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import type { BotCommand } from '../types';
import { buildEmbed } from '../utils/embed';

/**
 * Use this file as template when creating a new command.
 * Then register the new command inside src/commands/index.ts.
 */
const commandBoilerplate: BotCommand = {
  // "commands.categories.<category>" as indicated in config.json
  category: 'user', // user, staff, developer

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

  permissionMode_1: 'config', // integer levels from config.json
  permissionMode_2: 'discord', // native Discord permission flags
  permissionMode_3: 'both', // both config and discord flags
  
  data: new SlashCommandBuilder()
    // set command name; "/boilerplate", "/<command_name>"
    .setName('boilerplate')
    .setDescription('An example of a command description.'),
  async execute(interaction) {
    await interaction.reply({
      embeds: [
        buildEmbed('info')
        .setDescription('Example command response.')
      ],
      // using MessageFlags instead of deprecated 'ephemeral: true'
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default commandBoilerplate;
