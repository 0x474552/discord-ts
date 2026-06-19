import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import type { BotCommand } from '../../types';
import { buildEmbed } from '../../utils/embed';

/**
 * Example "ping" command that measures and displays latency.
 *
 * Features demonstrated:
 *   - SlashCommandBuilder definition
 *   - Embed reply via buildEmbed()
 *   - Roundtrip vs WebSocket latency
 *   - Ephemeral flag example
 *
 * Permission config (optional — remove or change as needed):
 *   - type: 'integer'  → 0=everyone, 1=mod, 2=admin, 3=owner
 *   - type: 'discord'  → PermissionFlagsBits array
 *   - type: 'role'     → Role name/ID array
 *   - undefined        → no restrictions
 */
const command: BotCommand = {
  category: 'user',
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot response speed and websocket latency.'),
  // permissions: { type: 'integer', level: 0 },  // uncomment to restrict

  async execute(interaction, client) {
    const sent = await interaction.reply({
      content: 'Pinging...',
      fetchReply: true,
      flags: MessageFlags.Ephemeral,
    });

    const roundTripMs = sent.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply({
      content: '',
      embeds: [
        buildEmbed('success')
          .setTitle('Pong')
          .addFields(
            { name: 'Roundtrip', value: `${roundTripMs}ms`, inline: true },
            { name: 'WebSocket', value: `${client.ws.ping}ms`, inline: true },
          ),
      ],
    });
  },
};

export default command;
