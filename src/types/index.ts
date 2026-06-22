import type {
  ChatInputCommandInteraction,
  Client,
  ClientEvents,
  Collection,
  PermissionResolvable,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

/** Command category key used in config. */
export type CommandCategory = 'user' | 'staff' | 'developer';

/**
 * Flexible permission configuration for a command.
 * Supports three modes:
 * - `integer`: 0;user, 1;staff, 2;admin, 3;developer, ...
 * - `discord`: DiscordJS permission flags
 * - `role`: role names or IDs
 */
export type PermissionConfig =
  | { type: 'integer'; level: number }
  | { type: 'discord'; permissions: PermissionResolvable[] }
  | { type: 'role'; roles: string[] };

/** Map of integer permission levels to descriptive label. */
export const PERMISSION_LEVELS: Record<number, string> = {
  0: 'User',
  1: 'Staff',
  2: 'Admin',
  3: 'Developer',
};

/** Map of integer permission levels → default Discord permissions. */
export const PERMISSION_LEVEL_MAP: Record<number, PermissionResolvable[]> = {
  0: [],
  1: ['BanMembers', 'KickMembers', 'MuteMembers'],
  2: ['Administrator'],
  3: [],
};

export interface BotCommand {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  category: CommandCategory;
  permissionLevel?: number;
  /**
   * Pick how this command should be permission-checked at runtime.
   * - config: integer levels from config.json
   * - discord: native Discord permission flags from this command file
   * - both: require both config level and Discord flags
   */
  permissionMode?: 'config' | 'discord' | 'both';
  /** Discord permission flags checked at runtime when permissionMode uses discord. */
  requiredDiscordPermissions?: PermissionResolvable[];
  execute: (interaction: ChatInputCommandInteraction, client: BotClient) => Promise<void>;
}

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
      if (required.length === 0) return true; // level 0 – user
      return required.every((perm) => member.permissions.has(perm as PermissionResolvable));
    }

    case 'discord':
      return config.permissions.every((perm) => member.permissions.has(perm));

    case 'role':
      return config.roles.some((role) =>
        member.roles.cache.some(
          (currentRole) => currentRole.name === role || currentRole.id === role,
        ),
      );

    default:
      return true;
  }
}

export interface BotEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (client: BotClient, ...args: ClientEvents[K]) => Promise<void> | void;
}

export type AnyBotEvent = {
  [K in keyof ClientEvents]: BotEvent<K>;
}[keyof ClientEvents];

export interface BotClient extends Client {
  commands: Collection<string, BotCommand>;
}

/**
 * Bot configuration loaded from config.json at runtime.
 * Secrets should stay in `.env`; this file is for shareable template settings.
 */
export interface AppConfig {
  /** Discord Gateway intents to enable on the client. */
  intents: string[];
  /** Discord partials to enable on the client. */
  partials: string[];
  /** Discord user IDs that should be treated as developers. */
  developers: string[];
  bot: {
    name: string;
    maintenanceMode: boolean;
    guildId: string;
    presence: {
      status: 'online' | 'idle' | 'dnd' | 'invisible';
      activities: Array<{
        name: string;
        type: 'Playing' | 'Streaming' | 'Listening' | 'Watching' | 'Competing';
      }>;
    };
  };
  /** Embed colors and footer configuration. */
  embedColors: Record<string, string>;
  embedFooter?: {
    enabled: boolean;
    textTemplate: string;
    showTimestamp: boolean;
  };
  /** Guild role IDs used by config-based permission levels. */
  guild: {
    roles: {
      staff: string;
      admin: string;
    };
  };
  /** Permission level mapping. */
  permissions: {
    levels: {
      user: number;
      staff: number;
      admin: number;
      developer: number;
    };
  };
  /** Command and category configuration. */
  commands: {
    disabled: string[];
    categories: Record<CommandCategory, { enabled: boolean }>;
  };
  /** Console logging configuration. */
  logging?: {
    enabled: boolean;
    level: string;
    outputs: {
      console: boolean;
    };
  };
}
