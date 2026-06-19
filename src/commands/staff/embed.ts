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
    .setDescription('Send a template embed to the current channel or a chosen text channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('The main embed message.')
        .setRequired(true)
        .setMaxLength(4000),
    )
    .addStringOption((option) =>
      option.setName('title').setDescription('Optional embed title.').setMaxLength(256),
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Optional target text channel. Defaults to the current channel.')
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

    const targetChannelOption = interaction.options.getChannel('channel');
    const targetChannel =
      targetChannelOption?.type === ChannelType.GuildText
        ? (targetChannelOption as TextChannel)
        : interaction.channel?.type === ChannelType.GuildText
          ? (interaction.channel as TextChannel)
          : null;

    if (!targetChannel) {
      await interaction.reply({
        embeds: [buildEmbed('error').setDescription('Please choose a valid text channel.')],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const message = interaction.options.getString('message', true);
    const title = interaction.options.getString('title');

    const embed = buildEmbed('primary').setDescription(message);
    if (title) {
      embed.setTitle(title);
    }

    await targetChannel.send({ embeds: [embed] });
    await interaction.reply({
      embeds: [buildEmbed('success').setDescription(`Embed sent to <#${targetChannel.id}>.`)],
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
