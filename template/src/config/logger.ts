export type LogLevel = 'silent' | 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, details?: unknown): void;
  info(message: string, details?: unknown): void;
  warn(message: string, details?: unknown): void;
  error(message: string, details?: unknown): void;
}

const rank: Record<LogLevel, number> = { silent: 99, debug: 10, info: 20, warn: 30, error: 40 };

export function createLogger(level: LogLevel): Logger {
  const emit = (l: Exclude<LogLevel, 'silent'>, message: string, details?: unknown) => {
    if (rank[l] < rank[level]) {
      return;
    }

    const row = {
      time: new Date().toISOString(),
      level: l,
      message,
      ...(details === undefined ? {} : { details }),
    };

    (l === 'error' ? console.error : l === 'warn' ? console.warn : console.log)(
      JSON.stringify(row),
    );
  };
  return {
    debug: (m, d) => emit('debug', m, d),
    info: (m, d) => emit('info', m, d),
    warn: (m, d) => emit('warn', m, d),
    error: (m, d) => emit('error', m, d),
  };
}
