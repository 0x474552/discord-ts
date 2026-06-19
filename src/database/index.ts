import { Database } from './Database';

function env(key: string): string {
  return process.env[key]?.trim() ?? '';
}

function envNumber(key: string, fallback: number): number {
  const value = env(key);
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number.`);
  }

  return parsed;
}

function envBoolean(key: string): boolean {
  return ['1', 'true', 'yes', 'on'].includes(env(key).toLowerCase());
}

function buildDatabase(): Database | null {
  // Let template users opt in with one obvious switch instead of trying to
  // infer database intent from partial credentials.
  if (!envBoolean('DB_ENABLED')) {
    return null;
  }

  // Database settings are intentionally env-only so connection details never
  // need to live in config.json.
  const host = env('DB_HOST');
  const user = env('DB_USER');
  const password = env('DB_PASSWORD');
  const database = env('DB_NAME');

  if (!host || !user || !database) {
    throw new Error(
      'DB_ENABLED is true, but DB_HOST, DB_USER, and DB_NAME must all be set in .env.',
    );
  }

  return new Database('main', {
    host,
    port: envNumber('DB_PORT', 3306),
    user,
    password,
    database,
    connectionLimit: envNumber('DB_CONNECTION_LIMIT', 10),
  });
}

export const mainDb = buildDatabase();

export function isDatabaseEnabled(): boolean {
  // A constructed database instance means the feature is enabled and has
  // already passed basic env validation.
  return mainDb !== null;
}
