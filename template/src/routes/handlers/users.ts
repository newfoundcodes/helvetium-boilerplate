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

import type { BootContext } from '@newfoundcodes/helvetium-boot';
import { usersRepository } from '../../database/repositories/UserRepository.js';

export async function listUsers(c: BootContext) {
  return c.json({
    data: await usersRepository().findMany({ orderBy: 'id', direction: 'desc', limit: 100 }),
  });
}

export async function showUser(c: BootContext) {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id < 1) {
    return c.json({ error: 'Invalid user id' }, 400);
  }

  const user = await usersRepository().findById(id);
  return user ? c.json({ data: user }) : c.json({ error: 'User not found' }, 404);
}

export async function createUser(c: BootContext) {
  const body = await c.req.json<{ email?: string; displayName?: string }>();
  if (!body.email || !body.displayName) {
    return c.json({ error: 'email and displayName are required' }, 422);
  }

  const row = await usersRepository().create({
    email: body.email.trim().toLowerCase(),
    displayName: body.displayName.trim(),
  });
  return c.json({ data: row }, 201);
}
