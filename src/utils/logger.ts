import { configManager } from '../config/ConfigManager';

// Logging severity levels
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

// Log level ID numbers:
// used to compare log levels against the configured logging threshold set
const LOG_WEIGHTS: Record<LogLevel, number> = {
  INFO: 0,
  SUCCESS: 0,
  WARN: 1,
  ERROR: 2,
};

/**
 * Determines whether a log msg of the given level should be written
 * based on the current logging configurations
 *
 * @param level Log severity level.
 * @returns Whether message should be written to console logs.
 */
function shouldWrite(level: LogLevel): boolean {
  const logging = configManager.config.logging;
  if (!logging?.enabled || logging.outputs.console === false) {
    return false;
  }

  const threshold = logging.level.toLowerCase();
  const minimumWeight = threshold === 'error' ? 2 : threshold === 'warn' ? 1 : 0;
  return LOG_WEIGHTS[level] >= minimumWeight;
}

/**
 * Writes a formatted log message to the console.
 * Messages are prefixed with a timestamp, log level and scope name.
 *
 * @param level Log severity level.
 * @param message Message to write.
 * @param scope Component or subsystem emitting the message.
 */
function write(level: LogLevel, message: string, scope = 'bot'): void {
  if (!shouldWrite(level)) {
    return;
  }

  const stamp = new Date().toISOString();
  const line = `[${stamp}] [${level}] (${scope}) ${message}`;

  if (level === 'ERROR') {
    console.error(line);
    return;
  }

  if (level === 'WARN') {
    console.warn(line);
    return;
  }

  console.log(line);
}

/**
 * Lightweight logger used throughout the bot.
 * Each method writes a message with its corresponding severity level and optional scope.
 */
export const log = {
  /**
   * Info message
   *
   * @param message Message to log.
   * @param scope Source of the message.
   */
  info: (message: string, scope?: string) => write('INFO', message, scope),

  /**
   * Warning message
   *
   * @param message Message to log.
   * @param scope Source of the message.
   */
  warn: (message: string, scope?: string) => write('WARN', message, scope),

  /**
   * Error message.
   *
   * @param message Message to log.
   * @param scope Source of the message.
   */
  error: (message: string, scope?: string) => write('ERROR', message, scope),

  /**
   * Success message.
   *
   * @param message Message to log.
   * @param scope Source of the message.
   */
  success: (message: string, scope?: string) => write('SUCCESS', message, scope),
};
