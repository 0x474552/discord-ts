type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

function write(level: LogLevel, message: string, scope = 'bot'): void {
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

export const log = {
  info: (message: string, scope?: string) => write('INFO', message, scope),
  warn: (message: string, scope?: string) => write('WARN', message, scope),
  error: (message: string, scope?: string) => write('ERROR', message, scope),
  success: (message: string, scope?: string) => write('SUCCESS', message, scope),
};
