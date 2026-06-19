import type { BotEvent } from '../types';
import { log } from '../utils/logger';

const event: BotEvent = {
  name: 'ready',
  once: true,
  execute(client) {
    log.success(`Logged in as ${(client as any).user?.tag ?? 'Unknown'}`, 'ready');
    log.info(`Serving ${(client as any).guilds?.cache?.size ?? 0} guilds`, 'ready');
  },
};

export default event;