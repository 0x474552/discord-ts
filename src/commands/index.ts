import type { BotCommand } from '../types';
import debugCommand from './developer/debug';
import embedCommand from './staff/embed';
import pingCommand from './user/ping';

/**
 * Register new command modules here.
 * Keeping this explicit makes the template easy to bundle and easy to read.
 */
export const commandRegistry: BotCommand[] = [pingCommand, embedCommand, debugCommand];
