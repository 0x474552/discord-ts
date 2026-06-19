import 'dotenv/config';
import { Collection } from 'discord.js';
import type { BotClient, BotCommand } from '../types';
import { loadCommands, registerSlashCommands } from '../handlers/CommandHandler';
import { log } from './logger';

async function run(): Promise<void> {
  // This client stub lets us reuse the same command loading path as the bot
  // runtime without starting a real Discord gateway connection.
  const client = {
    commands: new Collection<string, BotCommand>(),
    on: () => client,
    once: () => client,
  } as unknown as BotClient;

  const commands = await loadCommands(client);
  await registerSlashCommands(commands);
  log.success(`Deploy complete. Registered ${commands.length} command(s).`, 'deploy');
}

void run().catch((error) => {
  log.error(`Deploy failed: ${(error as Error).message}`, 'deploy');
  process.exitCode = 1;
});
