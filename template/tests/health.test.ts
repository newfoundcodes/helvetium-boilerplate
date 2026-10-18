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

import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEnvironment } from '../src/config/env.js';
import { closeDatabase, createDatabase } from '../src/database/index.js';
import { createApplication } from '../src/routes/paths.js';

test('health endpoint returns JSON', async () => {
  process.env.NODE_ENV = 'test';
  process.env.HOST = '127.0.0.1';
  process.env.PORT = '0';
  process.env.APP_ORIGIN = 'http://127.0.0.1';
  process.env.DATABASE_PATH = ':memory:';
  process.env.LOG_LEVEL = 'silent';
  process.env.TRUST_PROXY = 'false';

  const env = loadEnvironment();
  createDatabase(env);

  const app = createApplication();
  const response = await app.request('/api/health');
  assert.equal(response.status, 200);

  const data = (await response.json()) as { ok?: boolean };
  assert.equal(data.ok, true);

  await closeDatabase();
});
