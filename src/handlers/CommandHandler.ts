import { REST, Routes } from 'discord.js';
import type { BotClient, BotCommand } from '../types';
import { commandRegistry } from '../commands';
import { configManager } from '../config/ConfigManager';
import { log } from '../utils/logger';

export async function loadCommands(client: BotClient): Promise<BotCommand[]> {
  const config = configManager.config;
  const loaded: BotCommand[] = [];

  /**
   * Commands are loaded from a static registry so the template can bundle into
   * a minimal /dist output without shipping compiled command folders.
   */
  for (const command of commandRegistry) {
    if (config.commands.disabled.includes(command.data.name)) {
      continue;
    }

    if (!config.commands.categories[command.category]?.enabled) {
      continue;
    }

    client.commands.set(command.data.name, command);
    loaded.push(command);
    log.success(`Loaded /${command.data.name} [${command.category}]`, 'commands');
  }

  return loaded;
}

export async function registerSlashCommands(commands: BotCommand[]): Promise<void> {
  const token = configManager.env('DISCORD_TOKEN', true);
  const clientId = configManager.env('CLIENT_ID', true);
  const guildId = configManager.env('GUILD_ID') || configManager.config.bot.guildId;

  if (!guildId) {
    throw new Error(
      'Set GUILD_ID in .env or bot.guildId in config.json before registering commands.',
    );
  }

  const rest = new REST({ version: '10' }).setToken(token);
  const body = commands.map((command) => command.data.toJSON());

  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
  log.success(`Registered ${body.length} guild command(s).`, 'commands');
}
