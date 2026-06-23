import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import type {
  AppConfig,
  MemberAutoRoleConfig,
  MemberEventsConfig,
  MemberMessageConfig,
  WelcomeMemberMessageConfig,
} from '../types';

dotenv.config();

function resolveConfigPath(): string {
  return path.resolve(process.cwd(), 'config.json');
}

type RawMemberEventsConfig = Partial<{
  autorole: Partial<MemberAutoRoleConfig>;
  welcome: Partial<WelcomeMemberMessageConfig>;
  leave: Partial<MemberMessageConfig>;
}>;

type RawAppConfig = Omit<AppConfig, 'memberEvents'> & {
  memberEvents?: RawMemberEventsConfig;
};

function normalizeMemberEvents(
  memberEvents: RawMemberEventsConfig | undefined,
): MemberEventsConfig {
  return {
    autorole: {
      enabled: memberEvents?.autorole?.enabled ?? false,
      botRoleIds: memberEvents?.autorole?.botRoleIds ?? [],
      humanRoleIds: memberEvents?.autorole?.humanRoleIds ?? [],
    },
    welcome: {
      enabled: memberEvents?.welcome?.enabled ?? false,
      channelId: memberEvents?.welcome?.channelId ?? '',
      message:
        memberEvents?.welcome?.message ??
        'Welcome {userMention} to {guildName}! You are member #{memberCount}.',
      useEmbed: memberEvents?.welcome?.useEmbed ?? true,
      title: memberEvents?.welcome?.title ?? 'Welcome!',
      dmEnabled: memberEvents?.welcome?.dmEnabled ?? false,
      dmMessage: memberEvents?.welcome?.dmMessage ?? 'Welcome to {guildName}, {username}!',
    },
    leave: {
      enabled: memberEvents?.leave?.enabled ?? false,
      channelId: memberEvents?.leave?.channelId ?? '',
      message:
        memberEvents?.leave?.message ??
        '{userTag} left {guildName}. We are now at {memberCount} members.',
      useEmbed: memberEvents?.leave?.useEmbed ?? true,
      title: memberEvents?.leave?.title ?? 'Member Left',
    },
  };
}

class ConfigManager {
  private readonly configPath: string;
  /**
   * If you implement your own cache (CacheService.ts for example),
   * you can modify this to be cached under your own implementation.
   */
  private configCache: AppConfig;

  constructor() {
    this.configPath = resolveConfigPath();
    this.configCache = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    // Keep runtime config in one predictable place so new projects have a
    // single non-secret file to customize.
    const raw = fs.readFileSync(this.configPath, 'utf8');
    const parsed = JSON.parse(raw) as RawAppConfig;

    return {
      ...parsed,
      memberEvents: normalizeMemberEvents(parsed.memberEvents),
    };
  }

  reload(): void {
    this.configCache = this.loadConfig();
  }

  get config(): AppConfig {
    return this.configCache;
  }

  env(key: string, required = false): string {
    const value = process.env[key];
    if (!value && required) {
      throw new Error(`Missing required env var: ${key}`);
    }
    return value ?? '';
  }

  isDeveloper(userId: string): boolean {
    return this.configCache.developers.includes(userId);
  }

  getPermissionLevel(roleIds: string[], userId: string): number {
    // Config-based permission levels are useful when you want bot-specific
    // access rules that are independent from Discord permission flags.

    // This uses user ID defined as Developer under config.json
    // Helpful for commands meant only for the developer of the bot,
    // or for commands that are still in the testing phase.
    if (this.isDeveloper(userId)) {
      return this.configCache.permissions.levels.developer;
    }

    if (roleIds.includes(this.configCache.guild.roles.admin)) {
      return this.configCache.permissions.levels.admin;
    }

    if (roleIds.includes(this.configCache.guild.roles.staff)) {
      return this.configCache.permissions.levels.staff;
    }

    return this.configCache.permissions.levels.user;
  }
}

export const configManager = new ConfigManager();
export const config = configManager.config;
