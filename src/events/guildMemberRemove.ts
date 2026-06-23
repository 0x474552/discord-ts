import { Events } from 'discord.js';
import type { BotEvent } from '../types';
import { configManager } from '../config/ConfigManager';
import { sendMemberEventMessage } from '../utils/memberEvents';

const event: BotEvent<typeof Events.GuildMemberRemove> = {
  name: Events.GuildMemberRemove,
  async execute(_client, member) {
    const memberEvents = configManager.config.memberEvents;

    // This event can also be collapsed into one self-contained file if that
    // layout is easier for your project than keeping shared helpers.
    await sendMemberEventMessage({
      member,
      settings: memberEvents.leave,
      embedKind: 'warning',
      fallbackTitle: 'Goodbye!',
      logContext: 'guild-member-remove',
    });

    // Common extensions here include audit logging, offboarding cleanup,
    // and syncing member counts to an external store.
  },
};

export default event;
