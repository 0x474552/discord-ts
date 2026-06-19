/**
 * Simple coloured console logger with levels.
 * Usage: log.info('message', 'category')  log.error('message', 'category')
 */

const colours = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
} as const;

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function format(level: string, color: string, message: string, category?: string): string {
  const tag = category ? `[${category}]` : '';
  return `${colours.dim}${timestamp()}${colours.reset} ${color}${level}${colours.reset} ${tag} ${message}`;
}

export const log = {
  info(message: string, category?: string) {
    console.log(format('INFO', colours.cyan, message, category));
  },
  success(message: string, category?: string) {
    console.log(format(' OK ', colours.green, message, category));
  },
  warn(message: string, category?: string) {
    console.warn(format('WARN', colours.yellow, message, category));
  },
  error(message: string, category?: string) {
    console.error(format('ERR ', colours.red, message, category));
  },
};