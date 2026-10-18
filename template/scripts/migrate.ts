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

import { Migrator } from '@newfoundcodes/helvetium-alps';
import { loadEnvironment } from '../src/config/env.js';
import { closeDatabase, createDatabase } from '../src/database/index.js';
import { SqlMigrationStateStore } from '../src/database/MigrationStateStore.js';
import { migrations } from './migrations.js';

const command = process.argv[2] ?? 'up';
const env = loadEnvironment();
const alps = createDatabase(env);
const db = alps.sql('main');
const migrator = new Migrator(db, new SqlMigrationStateStore(db)).register(...migrations);

try {
  if (command === 'status') {
    console.table(await migrator.status());
  } else if (command === 'down') {
    console.log('Rolled back:', await migrator.down({ steps: 1, batch: false }));
  } else if (command === 'up') {
    console.log('Applied:', await migrator.up());
  } else {
    throw new Error(`Unknown migration command: ${command}`);
  }
} finally {
  await closeDatabase();
}
