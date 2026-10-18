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
