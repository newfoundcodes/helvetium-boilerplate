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

import { defineTable, types } from '@newfoundcodes/helvetium-alps';

export interface UserRow extends Record<string, unknown> {
  id: number;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export const usersTable = defineTable<UserRow>(
  'users',
  {
    id: types.integer({ primaryKey: true }),
    email: types.string(320, { unique: true }),
    displayName: types.string(120),
    createdAt: types.datetime({ default: 'CURRENT_TIMESTAMP' }),
    updatedAt: types.datetime({ default: 'CURRENT_TIMESTAMP' }),
  },
  { indexes: [{ name: 'users_email_idx', columns: ['email'], unique: true }] },
);
