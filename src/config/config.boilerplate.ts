import type { AppConfig } from '../types';

/**
 * Reference-only config snippet for people who want a typed example while
 * extending the starter.
 */
export const configBoilerplate: Partial<AppConfig> = {
  bot: {
    name: 'Template Bot',
    maintenanceMode: false,
    guildId: 'YOUR_GUILD_ID_HERE',
    presence: {
      status: 'online',
      activities: [{ name: '/ping', type: 'Watching' }],
    },
  },
};
