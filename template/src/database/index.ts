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
