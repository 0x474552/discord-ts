import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { Collection, REST, Routes } from 'discord.js';
import type { BotClient, BotCommand } from '../types';
import { log } from '../utils/logger';

/**
 * Recursively loads all command files from the commands directory
 * and populates the client.commands collection.
 */
export async function loadCommands(client: BotClient): Promise<void> {
  client.commands = new Collection();
  const commandsPath = join(__dirname, '..', 'commands');

  const categories = readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = join(commandsPath, category);
    const stats = statSync(categoryPath);

    if (!stats.isDirectory()) continue;

    const commandFiles = readdirSync(categoryPath).filter(
      (file) => file.endsWith('.ts') || file.endsWith('.js'),
    );

    for (const file of commandFiles) {
      try {
        const commandModule = await import(join(categoryPath, file));
        const command: BotCommand = commandModule.default ?? commandModule;

        if (!command || !command.data || !command.execute) {
          log.warn(`Skipped "${category}/${file}": missing data or execute`, 'commands');
          continue;
        }

        client.commands.set(command.data.name, command);
        log.info(`Loaded command: ${command.data.name} (${category})`, 'commands');
      } catch (err) {
        log.error(`Failed to load command "${category}/${file}": ${(err as Error).message}`, 'commands');
      }
    }
  }
}

/**
 * Registers all loaded slash commands with the Discord API.
 * If GUILD_ID is set in .env, registers only to that guild (fast updates).
 * Otherwise registers globally (may take up to 1 hour to propagate).
 */
export async function registerSlashCommands(client: BotClient): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId) {
    log.error('Missing DISCORD_TOKEN or CLIENT_ID in environment variables', 'commands');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(token);
  const commands: unknown[] = client.commands.map((cmd: BotCommand) => cmd.data.toJSON());

  try {
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      log.success(`Registered ${commands.length} guild commands`, 'commands');
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      log.success(`Registered ${commands.length} global commands`, 'commands');
    }
  } catch (err) {
    log.error(`Failed to register commands: ${(err as Error).message}`, 'commands');
  }
}