/**
 * Bot entry point.
 * Loads environment variables, initializes the Discord client,
 * loads commands and events, then logs in.
 */
import "dotenv/config";
import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import type { BotClient } from "./types";
import { log } from "./utils/logger";
import { loadConfig } from "./utils/config";
import { loadCommands } from "./handlers/CommandHandler";
/**
 * import { registerSlashCommands } from "./handlers/CommandHandler";
 * This is removed so it doesnt register commands for every startup by default.
 * This is kept as a separate cmd npm run register as this is just boilerplate codes.
 */ 

import { loadEvents } from "./handlers/EventHandler";

async function main(): Promise<void> {
  log.info("Booting...", "startup");

  // Load configuration from config.json
  const config = loadConfig();

  // Map string intents to GatewayIntentBits values
  const intents = config.intents.map(
    (name) => GatewayIntentBits[name as keyof typeof GatewayIntentBits],
  );

  // Map string partials to Partials values
  const partials = config.partials.map(
    (name) => Partials[name as keyof typeof Partials],
  );

  // Build the client with intents and partials from config
  const client = new Client({
    intents,
    partials,
  }) as BotClient;

  client.commands = new Collection();
  client.cooldowns = new Collection();

  // Load handlers
  await loadCommands(client);
  await loadEvents(client);

  // Log in to Discord
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    log.error("DISCORD_TOKEN is not set in .env", "startup");
    process.exit(1);
  }

  await client.login(token);
}

main().catch((err) => {
  log.error(`Fatal startup error: ${(err as Error).message}`, "startup");
  process.exit(1);
});

// ── Graceful Shutdown ──────────────────────────────────────────
process.on("SIGINT", () => {
  log.info("Shutting down gracefully (SIGINT)...", "shutdown");
  process.exit(0);
});

process.on("SIGTERM", () => {
  log.info("Shutting down gracefully (SIGTERM)...", "shutdown");
  process.exit(0);
});
