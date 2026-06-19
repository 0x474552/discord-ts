/**
 * Standalone script to register slash commands with Discord.
 * Run: npm run register
 * Reads commands from src/commands/ and pushes them via the REST API.
 */
import 'dotenv/config';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { REST, Routes } from 'discord.js';

const commands: unknown[] = [];
const commandsPath = join(__dirname, 'commands');

function loadCommands(dir: string): void {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      loadCommands(fullPath);
    } else if (stats.isFile() && (entry.endsWith('.ts') || entry.endsWith('.js'))) {
      // Dynamic require for command data
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(fullPath);
        const cmd = mod.default ?? mod;
        if (cmd?.data?.toJSON) {
          commands.push(cmd.data.toJSON());
        }
      } catch {
        // tsx will handle .ts files at runtime
      }
    }
  }
}

async function main(): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId) {
    console.error('Missing DISCORD_TOKEN or CLIENT_ID in .env');
    process.exit(1);
  }

  loadCommands(commandsPath);

  if (commands.length === 0) {
    console.error('No commands found to register.');
    process.exit(1);
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log(`Registered ${commands.length} guild commands.`);
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log(`Registered ${commands.length} global commands.`);
    }
  } catch (err) {
    console.error('Failed to register commands:', (err as Error).message);
    process.exit(1);
  }
}

main();