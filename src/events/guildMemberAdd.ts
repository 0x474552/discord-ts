import { Events } from 'discord.js';
import type { BotEvent } from '../types';
import { configManager } from '../config/ConfigManager';
import {
  applyConfiguredAutoRoles,
  sendMemberDirectMessage,
  sendMemberEventMessage,
} from '../utils/memberEvents';

const event: BotEvent<typeof Events.GuildMemberAdd> = {
  name: Events.GuildMemberAdd,
  async execute(_client, member) {
    const memberEvents = configManager.config.memberEvents;

    // If you prefer each event to own all of its logic inline,
    // you can replace these helper calls with direct role/message code here.
    await applyConfiguredAutoRoles(member, memberEvents.autorole, 'guild-member-add');

    await sendMemberEventMessage({
      member,
      settings: memberEvents.welcome,
      embedKind: 'success',
      fallbackTitle: 'Welcome!',
      logContext: 'guild-member-add',
    });

    await sendMemberDirectMessage(
      member,
      memberEvents.welcome.dmEnabled,
      memberEvents.welcome.dmMessage,
      'guild-member-add',
    );

    // Add any project-specific onboarding flow here, such as:
    // - creating a database row
    // - assigning starter resources
    // - triggering analytics or audit logs
  },
};

export default event;
