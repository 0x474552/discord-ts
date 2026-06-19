import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { BotConfig } from '../types';

let cachedConfig: BotConfig | null = null;

/**
 * Loads bot configuration from config.json at the project root.
 * Caches the result after the first call.
 */
export function loadConfig(): BotConfig {
  if (cachedConfig) return cachedConfig;

  const configPath = resolve(__dirname, '..', '..', 'config.json');
  const raw = readFileSync(configPath, 'utf-8');
  cachedConfig = JSON.parse(raw) as BotConfig;
  return cachedConfig;
}

/**
 * Returns the cached config or null if not yet loaded.
 */
export function getConfig(): BotConfig | null {
  return cachedConfig;
}