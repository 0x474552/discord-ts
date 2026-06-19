import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import type { AppConfig } from '../types';

dotenv.config();

function resolveConfigPath(): string {
  return path.resolve(process.cwd(), 'config.json');
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
    return JSON.parse(raw) as AppConfig;
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
