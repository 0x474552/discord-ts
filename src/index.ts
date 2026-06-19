import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import type { BotClient } from './types';
import { configManager } from './config/ConfigManager';
import { isDatabaseEnabled, mainDb } from './database';
import { loadCommands } from './handlers/CommandHandler';
import { loadEvents } from './handlers/EventHandler';
import { log } from './utils/logger';

async function main(): Promise<void> {
  // Keep the starter client intentionally small. Add more intents only when a
  // new feature truly needs them.
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  }) as BotClient;

  client.commands = new Collection();

  if (isDatabaseEnabled() && mainDb) {
    await mainDb.connect();
  }

  await loadCommands(client);
  await loadEvents(client);

  process.on('unhandledRejection', (error) => {
    log.error(`Unhandled rejection: ${String(error)}`, 'process');
  });

  process.on('uncaughtException', (error) => {
    log.error(`Uncaught exception: ${(error as Error).message}`, 'process');
  });

  // Graceful shutdown becomes important as soon as you add a database or any
  // long-lived service to the starter.
  const shutdown = async (): Promise<void> => {
    await mainDb?.close().catch(() => undefined);
    client.destroy();
  };

  process.on('SIGINT', () => {
    void shutdown().finally(() => process.exit(0));
  });

  process.on('SIGTERM', () => {
    void shutdown().finally(() => process.exit(0));
  });

  await client.login(configManager.env('DISCORD_TOKEN', true));
}

void main().catch((error) => {
  log.error(`Startup failed: ${(error as Error).message}`, 'startup');
  process.exit(1);
});
