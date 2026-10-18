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
