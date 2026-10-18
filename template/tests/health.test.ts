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
