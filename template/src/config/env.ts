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

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';

export interface Environment {
  NODE_ENV: 'development' | 'test' | 'production';
  HOST: string;
  PORT: number;
  APP_ORIGIN: string;
  DATABASE_PATH: string;
  LOG_LEVEL: 'silent' | 'debug' | 'info' | 'warn' | 'error';
  TRUST_PROXY: boolean;
}

const loaded = new Set<string>();
function read(path: string): Record<string, string | undefined> {
  if (!existsSync(path)) {
    return {};
  }
  loaded.add(path);
  return parseEnv(readFileSync(path, 'utf8'));
}

function bool(v: string | undefined, fallback = false): boolean {
  if (v === undefined) {
    return fallback;
  }

  if (['1', 'true', 'yes', 'on'].includes(v.toLowerCase())) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(v.toLowerCase())) {
    return false;
  }

  throw new Error(`Invalid boolean environment value: ${v}`);
}

function num(v: string | undefined, fallback: number): number {
  const n = Number(v ?? fallback);
  if (!Number.isFinite(n) || n < 0 || n > 65535) {
    throw new Error(`Invalid PORT: ${v}`);
  }

  return n;
}
export function loadEnvironment(cwd = process.cwd()): Environment {
  const initial = { ...process.env } as Record<string, string | undefined>;
  const nodeEnv = (initial.NODE_ENV ?? 'development') as Environment['NODE_ENV'];
  const layers = ['.env', `.env.${nodeEnv}`, '.env.local', `.env.${nodeEnv}.local`];
  const merged: Record<string, string | undefined> = {};

  for (const file of layers) {
    Object.assign(merged, read(resolve(cwd, file)));
  }

  Object.assign(merged, initial);

  const example = read(resolve(cwd, '.env.example'));
  for (const key of Object.keys(example)) {
    if (merged[key] === undefined || merged[key] === '') {
      throw new Error(`Missing required environment variable ${key}. See .env.example.`);
    }
  }

  Object.assign(process.env, merged);
  return Object.freeze({
    NODE_ENV: nodeEnv,
    HOST: merged.HOST ?? '127.0.0.1',
    PORT: num(merged.PORT, __PORT__),
    APP_ORIGIN: merged.APP_ORIGIN ?? `http://127.0.0.1:${num(merged.PORT, __PORT__)}`,
    DATABASE_PATH: merged.DATABASE_PATH ?? './storage/app.sqlite3',
    LOG_LEVEL: (merged.LOG_LEVEL ?? 'info') as Environment['LOG_LEVEL'],
    TRUST_PROXY: bool(merged.TRUST_PROXY),
  });
}

export function loadedEnvironmentFiles(): string[] {
  return [...loaded];
}
