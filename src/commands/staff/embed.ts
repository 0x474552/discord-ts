import {
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type TextChannel,
} from 'discord.js';
import type { BotCommand } from '../../types';
import { buildEmbed } from '../../utils/embed';

const command: BotCommand = {
  category: 'staff',
  permissionMode: 'discord',
  requiredDiscordPermissions: [PermissionFlagsBits.ManageMessages],
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Send a template embed.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('The embed message.')
        .setRequired(true)
        .setMaxLength(4000),
    )
    .addStringOption((option) =>
      option.setName('title').setDescription('Optional embed title.').setMaxLength(256),
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Target text channel. Defaults to the current channel.')
        .addChannelTypes(ChannelType.GuildText),
    ),

  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Fall back to the current channel when none is specified.
    const targetChannel =
      (interaction.options.getChannel('channel') as TextChannel | null) ??
      (interaction.channel as TextChannel);

    const embed = buildEmbed('primary').setDescription(
      interaction.options.getString('message', true),
    );

    const title = interaction.options.getString('title');
    if (title) embed.setTitle(title);

    await targetChannel.send({
      embeds: [embed],
    });

    await interaction.reply({
      embeds: [buildEmbed('success').setDescription(`Embed sent to <#${targetChannel.id}>.`)],
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
