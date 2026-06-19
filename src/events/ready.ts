import { ActivityType, Events } from 'discord.js';
import type { BotEvent } from '../types';
import { configManager } from '../config/ConfigManager';
import { formatString } from '../utils/embed';
import { log } from '../utils/logger';

const event: BotEvent<typeof Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    log.success(`Logged in as ${client.user?.tag ?? 'unknown user'}`, 'ready');

    const firstActivity = configManager.config.bot.presence.activities[0];
    if (!firstActivity) {
      return;
    }

    // Keep one simple presence entry by default. Projects that need rotating
    // presence can extend this event later.
    client.user?.setPresence({
      status: configManager.config.bot.presence.status,
      activities: [
        {
          name: formatString(firstActivity.name, {
            botName: configManager.config.bot.name,
          }),
          type: ActivityType[firstActivity.type],
        },
      ],
    });
  },
};

export default event;
