import type { AnyBotEvent } from '../types';
import interactionCreateEvent from './interactionCreate';
import readyEvent from './ready';

/**
 * Register new event modules here.
 */
export const eventRegistry: AnyBotEvent[] = [readyEvent, interactionCreateEvent];
