import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import type { BotClient } from './types';
import { configManager } from './config/ConfigManager';
import { isDatabaseEnabled, mainDb } from './database';
import { loadCommands } from './handlers/CommandHandler';
import { loadEvents } from './handlers/EventHandler';
import { log } from './utils/logger';

// Prevent multiple shutdown attempts.
let shuttingDown = false;

/**
 * Resolves string keys from configuration into numeric enum values.
 *
 * Unknown keys are ignored and logged as warnings.
 *
 * @param keys Configuration values to resolve.
 * @param source Enum object to resolve against.
 * @param label Value type used in warning messages.
 * @returns Valid numeric enum values.
 */
function resolveEnumValues<T extends Record<string, string | number>>(
  keys: string[],
  source: T,
  label: string,
): number[] {
  return keys.flatMap((key) => {
    const value = source[key as keyof T];
    if (typeof value !== 'number') {
      log.warn(`Ignoring unknown ${label} value "${key}" in config.json.`, 'startup');
      return [];
    }

    return [value];
  });
}

/**
 * Initializes and starts the Discord bot.
 */
async function main(): Promise<void> {
  const config = configManager.config;
  const token = configManager.env('DISCORD_TOKEN', true);
  const intents = resolveEnumValues(config.intents, GatewayIntentBits, 'intent');
  const partials = resolveEnumValues(config.partials, Partials, 'partial');

  const client = new Client({
    intents: intents.length > 0 ? intents : [GatewayIntentBits.Guilds],
    partials,
  }) as BotClient;

  client.commands = new Collection();

  if (isDatabaseEnabled() && mainDb) {
    await mainDb.connect();
  }

  await loadCommands(client);
  await loadEvents(client);

  process.on('unhandledRejection', (reason) => {
    log.error(`Unhandled rejection: ${String(reason)}`, 'process');
  });

  process.on('uncaughtException', (error) => {
    log.error(`Uncaught exception: ${error.stack ?? error.message}`, 'process');
  });

  const shutdown = async (): Promise<void> => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    await mainDb?.close().catch(() => undefined);

    client.destroy();
  };

  process.on('SIGINT', () => {
    void shutdown().finally(() => process.exit(0));
  });

  process.on('SIGTERM', () => {
    void shutdown().finally(() => process.exit(0));
  });

  await client.login(token);
}

void main().catch((error) => {
  // tidy up so easier to read
  const err = error as Error;

  log.error(`Startup failed: ${err.stack ?? err.message}`, 'startup');

  process.exit(1);
});
