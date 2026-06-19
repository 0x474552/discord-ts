import type {
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  ChatInputCommandInteraction,
  PermissionResolvable,
} from 'discord.js';
import type { BotClient } from './client';

// Re-export so consumers can import from '../types'
export type { BotClient } from './client';

/**
 * Flexible permission configuration for a command.
 * Supports three modes:
 *   - `integer` ⇒ 0=everyone, 1=moderator, 2=admin, 3=owner
 *   - `discord`  ⇒ Discord PermissionFlagsBits (e.g. BanMembers, KickMembers)
 *   - `role`     ⇒ Array of role names or IDs
 *
 * Add new levels to the `integer` map below as needed.
 */
export type PermissionConfig =
  | { type: 'integer'; level: number }
  | { type: 'discord'; permissions: PermissionResolvable[] }
  | { type: 'role'; roles: string[] };

/** Map of integer permission levels → descriptive label (add more as needed). */
export const PERMISSION_LEVELS: Record<number, string> = {
  0: 'Everyone',
  1: 'Moderator',
  2: 'Admin',
  3: 'Owner',
};

/** Map of integer permission levels → default Discord permissions. */
export const PERMISSION_LEVEL_MAP: Record<number, PermissionResolvable[]> = {
  0: [],
  1: ['BanMembers', 'KickMembers', 'MuteMembers'],
  2: ['Administrator'],
  3: [],
};

/**
 * Checks whether a member satisfies the required permission config.
 * Returns `true` if allowed, `false` otherwise.
 */
export function checkPermissions(
  member: import('discord.js').GuildMember | null,
  config: PermissionConfig | undefined,
): boolean {
  if (!config) return true; // no restrictions
  if (!member) return false;

  switch (config.type) {
    case 'integer': {
      // Owner check: guild owner always passes
      if (config.level >= 3 && member.id === member.guild.ownerId) return true;
      // Admin check: Administrator bypasses everything
      if (config.level >= 1 && member.permissions.has('Administrator')) return true;
      // Check specific Discord permissions assigned to this level
      const required = PERMISSION_LEVEL_MAP[config.level] ?? [];
      if (required.length === 0) return true; // level 0 – everyone
      return required.every((perm) => member.permissions.has(perm as PermissionResolvable));
    }

    case 'discord':
      return config.permissions.every((perm) => member.permissions.has(perm));

    case 'role':
      return config.roles.some((role) =>
        member.roles.cache.some((r) => r.name === role || r.id === role),
      );

    default:
      return true;
  }
}

/** Structure for a single slash command. */
export interface BotCommand {
  /** Category folder name (e.g. "general", "moderation"). */
  category: string;
  /** Slash command builder definition. */
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  /** Optional permission configuration. Leave undefined for everyone. */
  permissions?: PermissionConfig;
  /** Command execution handler. */
  execute: (interaction: ChatInputCommandInteraction, client: BotClient) => Promise<void>;
}

/** Structure for a single event listener. */
export interface BotEvent {
  /** Discord event name (e.g. "ready", "interactionCreate"). */
  name: string;
  /** Whether the event should fire only once. */
  once?: boolean;
  /** Event handler – receives event args plus the client. */
  execute: (...args: unknown[]) => Promise<void> | void;
}

/** Command category key used in config. */
export type CommandCategory = 'general' | 'moderation' | 'admin' | 'utility' | string;

/**
 * Bot configuration loaded from config.json at runtime.
 * Keeps non-secret settings separate from .env secrets.
 */
export interface BotConfig {
  /** Discord Gateway intents to enable on the client. */
  intents: string[];
  /** Discord partials to enable on the client. */
  partials: string[];
  /** Guild ID for instant command registration (development only). Empty = global. */
  devGuildId: string;
  /** Default cooldown in seconds between command uses. */
  cooldownDefault: number;
  /** Bot presence configuration. */
  presence: {
    status: 'online' | 'idle' | 'dnd' | 'invisible';
    activities: Array<{
      name: string;
      type: 'Playing' | 'Streaming' | 'Listening' | 'Watching' | 'Competing';
    }>;
  };
  /** Permission level mapping. */
  permissions: {
    levels: Record<string, number>;
  };
  /** Command and category configuration. */
  commands: {
    disabled: string[];
    categories: Record<string, { enabled: boolean }>;
  };
  /** Default embed styles for common message types. */
  embedDefaults: Record<
    string,
    {
      colour: string;
      defaultTitle: string;
    }
  >;
  /** Logging configuration. */
  logging: {
    enabled: boolean;
    level: string;
    outputs: {
      console: boolean;
      files: {
        combined: boolean;
        error: boolean;
      };
    };
  };
}