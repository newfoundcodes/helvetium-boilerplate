/*
 * Helvetium Boilerplate - Helvetium Framework, A Newfoundcodes project.
 *
 * Copyright (C) 2026 Jonathan Eldy Baldivicio
 *
 * Author: Jonathan Eldy Baldivicio
 * Contact: jonathaneldy.baldivicio@newfoundcodes.com
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
