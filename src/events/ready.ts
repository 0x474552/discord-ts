import { ActivityType, Events } from 'discord.js';
import type { BotEvent } from '../types';
import { configManager } from '../config/ConfigManager';
import { formatString } from '../utils/embed';
import { log } from '../utils/logger';

const event: BotEvent<typeof Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    // Add null user check
    if (!client.user) {
      log.error('Client user is not available yet.', 'ready');
      return;
    }

    log.success(`Logged in as ${client.user.tag}`, 'ready');

    // Use 'activities?." option for safety; prevent crash if configuration is incomplete
    const firstActivity = configManager.config.bot.presence.activities?.[0];
    if (!firstActivity) {
      return;
    }

    // Validate ActivityType mapping safely to prevent invalid enum indexing
    // As this could silently become undefined if config is wrong,
    // add explicit validation + logging
    const activityType = ActivityType[firstActivity.type as keyof typeof ActivityType];
    if (activityType === undefined) {
      log.error(`Invalid activity type in config: ${firstActivity.type}`, 'ready');
      return;
    }

    // Keep one simple presence entry by default. Projects that need rotating
    // presence can extend this event later.
    client.user.setPresence({
      status: configManager.config.bot.presence.status,
      activities: [
        {
          name: formatString(firstActivity.name, {
            botName: configManager.config.bot.name,
          }),
          type: activityType,
        },
      ],
    });
  },
};

export default event;
