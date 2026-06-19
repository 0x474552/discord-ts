import { readdirSync } from 'fs';
import { join } from 'path';
import type { BotClient, BotEvent } from '../types';
import { log } from '../utils/logger';

/**
 * Loads all event files from the events directory and registers them on the client.
 * Files should export a BotEvent object as default.
 */
export async function loadEvents(client: BotClient): Promise<void> {
  const eventsPath = join(__dirname, '..', 'events');
  const eventFiles = readdirSync(eventsPath).filter(
    (file) => file.endsWith('.ts') || file.endsWith('.js'),
  );

  for (const file of eventFiles) {
    try {
      const eventModule = await import(join(eventsPath, file));
      const event: BotEvent = eventModule.default ?? eventModule;

      if (!event || !event.name || !event.execute) {
        log.warn(`Skipped "${file}": missing name or execute function`, 'events');
        continue;
      }

      /* Register the event — spread args so the client passes them naturally. */
      if (event.once) {
        client.once(event.name, (...args: unknown[]) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args: unknown[]) => event.execute(...args, client));
      }

      log.info(`Loaded event: ${event.name}`, 'events');
    } catch (err) {
      log.error(`Failed to load event "${file}": ${(err as Error).message}`, 'events');
    }
  }
}