import { defineMigration } from '@newfoundcodes/helvetium-alps';
import { usersTable } from '../src/database/tables/users.js';

export default defineMigration('09052026_153324_create_users', {
  up({ schema }) {
    schema.createTable(usersTable, { ifNotExists: true });
  },
  down({ schema }) {
    schema.dropTable('users');
  },
});
