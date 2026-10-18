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
