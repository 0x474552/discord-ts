import type { AnyBotEvent } from '../types';
import guildMemberAddEvent from './guildMemberAdd';
import guildMemberRemoveEvent from './guildMemberRemove';
import interactionCreateEvent from './interactionCreate';
import readyEvent from './ready';

/**
 * Register new event modules here.
 */
export const eventRegistry: AnyBotEvent[] = [
  readyEvent,
  interactionCreateEvent,
  guildMemberAddEvent,
  guildMemberRemoveEvent,
];
