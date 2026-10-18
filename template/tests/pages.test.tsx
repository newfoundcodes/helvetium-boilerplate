import test from 'node:test';
import assert from 'node:assert/strict';
import { loadEnvironment } from '../src/config/env.js';
import { closeDatabase, createDatabase } from '../src/database/index.js';
import { createApplication } from '../src/routes/paths.js';

test('home page renders document template', async () => {
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
  const response = await app.request('/');
  const html = await response.text();

  assert.match(html, /<html/);
  assert.match(html, /Build one application/);
  assert.match(html, /site-nav/);

  await closeDatabase();
});
