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
  APIARY_ADMIN_TOKEN?: string;
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
    APIARY_ADMIN_TOKEN: merged.APIARY_ADMIN_TOKEN,
  });
}

export function loadedEnvironmentFiles(): string[] {
  return [...loaded];
}
