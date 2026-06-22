import type { ClientEvents } from 'discord.js';
import type { AnyBotEvent, BotClient } from '../types';
import { eventRegistry } from '../events';
import { log } from '../utils/logger';

type RuntimeEvent = {
  name: keyof ClientEvents;
  once?: boolean;
  execute: (client: BotClient, ...args: unknown[]) => Promise<void> | void;
};

export async function loadEvents(client: BotClient): Promise<void> {
  /**
   * Events are loaded from a source registry for the same reason as commands:
   * predictable bundling and a very small /dist output.
   */
  for (const event of eventRegistry) {
    // We keep strong typing in each event module, then widen slightly here so
    // one generic runtime loader can attach every event shape.
    const typedEvent = event as AnyBotEvent as RuntimeEvent;

    // Make handler explicitly match client.on(), so "...args: any[]" can be removed
    const handler = (...args: unknown[]): void => {
      void Promise.resolve(typedEvent.execute(client, ...args)).catch((error: Error) =>
        log.error(`${typedEvent.name}: ${error.message}`, 'events'),
      );
    };

    if (typedEvent.once) {
      client.once(typedEvent.name, handler);
    } else {
      client.on(typedEvent.name, handler);
    }

    log.success(`Loaded event: ${typedEvent.name}`, 'events');
  }
}
