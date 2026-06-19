import { MessageFlags, SlashCommandBuilder, version as discordJsVersion } from 'discord.js';
import type { BotCommand } from '../../types';
import { isDatabaseEnabled, mainDb } from '../../database';
import { buildEmbed } from '../../utils/embed';

function formatUptime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(1)} ${units[index]}`;
}

const command: BotCommand = {
  category: 'developer',
  permissionLevel: 3,
  permissionMode: 'config',
  data: new SlashCommandBuilder()
    .setName('debug')
    .setDescription('Show a small runtime diagnostic panel for developers.'),
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const memoryUsage = process.memoryUsage();
    const dbStatus = isDatabaseEnabled()
      ? (await mainDb?.healthy())
        ? 'connected'
        : 'down'
      : 'disabled';

    await interaction.editReply({
      embeds: [
        buildEmbed('info')
          .setTitle('Debug')
          .addFields(
            { name: 'Uptime', value: formatUptime(client.uptime ?? 0), inline: true },
            { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
            { name: 'Guilds', value: `${client.guilds.cache.size}`, inline: true },
            { name: 'Users', value: `${client.users.cache.size}`, inline: true },
            { name: 'Commands', value: `${client.commands.size}`, inline: true },
            { name: 'Node', value: process.version, inline: true },
            { name: 'discord.js', value: discordJsVersion, inline: true },
            { name: 'Database', value: dbStatus, inline: true },
            { name: 'RSS', value: formatBytes(memoryUsage.rss), inline: true },
            { name: 'Heap Used', value: formatBytes(memoryUsage.heapUsed), inline: true },
          ),
      ],
    });
  },
};

export default command;
