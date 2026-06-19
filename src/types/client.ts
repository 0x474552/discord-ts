import type { Client, Collection } from 'discord.js';
import type { BotCommand } from './index';

/** Extended bot client with commands and cooldowns collections. */
export interface BotClient extends Client {
  commands: Collection<string, BotCommand>;
  cooldowns: Collection<string, Collection<string, number>>;
}