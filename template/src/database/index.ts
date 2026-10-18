import Database from 'better-sqlite3';
import { Alps, sqlitePrepared } from '@newfoundcodes/helvetium-alps';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { Environment } from '../config/env.js';

let current: Alps | undefined;
export function createDatabase(env: Environment): Alps {
  if (current) {
    return current;
  }

  const path = env.DATABASE_PATH === ':memory:' ? ':memory:' : resolve(env.DATABASE_PATH);
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }

  const sqlite = new Database(path);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  current = new Alps({ defaultDatabase: 'main' }).register('main', sqlitePrepared(sqlite));
  return current;
}

export function database(): Alps {
  if (!current) {
    throw new Error('Database has not been initialized');
  }

  return current;
}

export async function closeDatabase(): Promise<void> {
  if (current) {
    await current.close();
    current = undefined;
  }
}
