import { Repository } from '@newfoundcodes/helvetium-alps';
import { database } from '../index.js';
import { usersTable, type UserRow } from '../tables/users.js';

export function usersRepository(): Repository<UserRow> {
  return new Repository<UserRow>(database().sql('main'), usersTable, { primaryKey: 'id' });
}
