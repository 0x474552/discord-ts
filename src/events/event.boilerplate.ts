import { Events } from 'discord.js';
import type { BotEvent } from '../types';
import { log } from '../utils/logger';

/**
 * Copy this file when creating a new gateway event.
 * Then register the new event inside src/events/index.ts.
 */
const eventBoilerplate: BotEvent<typeof Events.GuildCreate> = {
  name: Events.GuildCreate,
  async execute(_client, guild) {
    log.info(`Joined guild: ${guild.name}`, 'event-boilerplate');
  },
};

export default eventBoilerplate;
