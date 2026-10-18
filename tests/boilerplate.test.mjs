import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createProject,
  manifest,
  planProject,
  templateFiles,
  validatePackageName,
} from '../dist/index.js';

async function temp() {
  return mkdtemp(join(tmpdir(), 'helvetium-boilerplate-'));
}

async function generated(options = {}) {
  const base = await temp();
  const target = join(base, 'app');

  await createProject({ targetDirectory: target, ...options });
  return { base, target };
}

test('01 validates unscoped package names', () =>
  assert.equal(validatePackageName('my-app'), true));

test('02 validates scoped package names', () =>
  assert.equal(validatePackageName('@scope/my-app'), true));

test('03 rejects invalid npm package names', () =>
  assert.equal(validatePackageName('Bad Name'), false));

test('04 manifest pins the coordinated Helvetium releases', () =>
  assert.deepEqual(manifest.framework, {
    boot: '0.1.2',
    dom: '0.1.2',
    alps: '0.1.1',
    apiary: '0.1.1',
    mcp: '0.1.1',
  }));

test('05 manifest default port is 3000', () => assert.equal(manifest.defaultPort, 3000));

test('06 plan derives a slug package name', async () => {
  const d = await temp();
  const p = await planProject({ targetDirectory: join(d, 'My App') });

  assert.equal(p.packageName, 'my-app');
  await rm(d, { recursive: true, force: true });
});

test('07 plan accepts port zero for test servers', async () => {
  const d = await temp();
  const p = await planProject({ targetDirectory: join(d, 'app'), port: 0 });

  assert.equal(p.port, 0);
  await rm(d, { recursive: true, force: true });
});

test('08 plan rejects invalid ports', async () => {
  const d = await temp();

  await assert.rejects(() => planProject({ targetDirectory: d, port: 70000 }), /Invalid port/);
  await rm(d, { recursive: true, force: true });
});

test('09 template contains the requested project structure', async () => {
  const files = await templateFiles();
  for (const p of [
    'src/web.ts',
    'src/index.tsx',
    'src/app/components/FooterComponent.tsx',
    'src/app/components/NavigationBarComponent.tsx',
    'src/routes/paths.ts',
    'src/routes/handlers/health.ts',
    'src/routes/handlers/users.ts',
    'src/routes/mcp/ping.ts',
    'src/middlewares/page.ts',
    'background/index.ts',
    'background/workers/example.ts',
    'migrations/09052026_153324_create_users.ts',
    'server.ts',
  ]) {
    assert.ok(files.includes(p), p);
  }
});

test('10 template also contains production support files', async () => {
  const files = await templateFiles();
  for (const p of [
    'Dockerfile',
    'compose.yaml',
    '.github/workflows/ci.yml',
    '.env.example',
    '.env.test',
    'src/app.css',
    'tailwind.config.mjs',
    'scripts/migrate.ts',
    'tests/health.test.ts',
  ]) {
    assert.ok(files.includes(p), p);
  }
});

test('11 generated project renders name package and port tokens', async () => {
  const { base, target } = await generated({
    projectName: 'Example App',
    packageName: '@example/app',
    port: 4321,
  });
  const pkg = JSON.parse(await readFile(join(target, 'package.json'), 'utf8'));

  assert.equal(pkg.name, '@example/app');
  assert.match(await readFile(join(target, '.env.example'), 'utf8'), /PORT=4321/);
  assert.match(await readFile(join(target, 'src/index.tsx'), 'utf8'), /Example App/);

  await rm(base, { recursive: true, force: true });
});

test('12 generated project creates dotfiles', async () => {
  const { base, target } = await generated();
  const names = await readdir(target);

  assert.ok(names.includes('.gitignore'));
  assert.ok(names.includes('.dockerignore'));
  assert.ok(names.includes('.env.example'));

  await rm(base, { recursive: true, force: true });
});

test('13 generated project creates GitHub Actions path', async () => {
  const { base, target } = await generated();

  const workflow = await readFile(join(target, '.github/workflows/ci.yml'), 'utf8');
  assert.match(workflow, /npm install/);
  assert.doesNotMatch(workflow, /npm ci/);
  assert.match(workflow, /npm run migrate/);
  assert.match(workflow, /npm run check/);

  await rm(base, { recursive: true, force: true });
});

test('14 generated package declares the supported core packages', async () => {
  const { base, target } = await generated();
  const p = JSON.parse(await readFile(join(target, 'package.json'), 'utf8'));

  assert.equal(p.dependencies['@newfoundcodes/helvetium-boot'], `^${manifest.framework.boot}`);
  assert.equal(p.dependencies['@newfoundcodes/helvetium-dom'], `^${manifest.framework.dom}`);
  assert.equal(p.dependencies['@newfoundcodes/helvetium-alps'], `^${manifest.framework.alps}`);
  assert.equal(p.dependencies['@newfoundcodes/helvetium-apiary'], `^${manifest.framework.apiary}`);
  assert.equal(p.dependencies['@newfoundcodes/helvetium-mcp'], `^${manifest.framework.mcp}`);

  await rm(base, { recursive: true, force: true });
});

test('optional Alps output removes database files and commands', async () => {
  const { base, target } = await generated({ useAlps: false });
  const pkg = JSON.parse(await readFile(join(target, 'package.json'), 'utf8'));
  const paths = await readFile(join(target, 'src/routes/paths.ts'), 'utf8');
  const readme = await readFile(join(target, 'README.md'), 'utf8');

  assert.equal(pkg.dependencies['@newfoundcodes/helvetium-alps'], undefined);
  assert.equal(pkg.dependencies['better-sqlite3'], undefined);
  assert.equal(pkg.scripts.migrate, undefined);
  assert.doesNotMatch(paths, /healthHandler|usersRepository|\/api\/users/);
  assert.doesNotMatch(readme, /npm run migrate|src\/database|migrations/);

  await assert.rejects(() => readFile(join(target, 'src/database/index.ts')));
  await assert.rejects(() => readFile(join(target, 'src/routes/handlers/health.ts')));

  await rm(base, { recursive: true, force: true });
});

test('15 browser entry does not import the server composition module', async () => {
  const { base, target } = await generated();
  const web = await readFile(join(target, 'src/web.ts'), 'utf8');

  assert.match(web, /\.\/app\/routes\.js/);
  assert.doesNotMatch(web, /routes\/paths/);
  assert.doesNotMatch(web, /helvetium-boot|helvetium-alps|better-sqlite3/);

  await rm(base, { recursive: true, force: true });
});

test('16 server configures static serving and serve()', async () => {
  const { base, target } = await generated();
  const server = await readFile(join(target, 'server.ts'), 'utf8');

  assert.match(server, /serveStatic/);
  assert.match(server, /const handle = serve/);
  assert.match(server, /SIGTERM/);

  await rm(base, { recursive: true, force: true });
});

test('17 migration runner uses persistent SQL migration state', async () => {
  const { base, target } = await generated();
  const script = await readFile(join(target, 'scripts/migrate.ts'), 'utf8');
  assert.match(script, /SqlMigrationStateStore/);

  const store = await readFile(join(target, 'src/database/MigrationStateStore.ts'), 'utf8');
  assert.match(store, /__helvetium_migrations/);

  await rm(base, { recursive: true, force: true });
});

test('18 refuses a non-empty target without force', async () => {
  const d = await temp();

  await writeFile(join(d, 'existing.txt'), 'x');
  await assert.rejects(() => createProject({ targetDirectory: d }), /not empty/);
  await rm(d, { recursive: true, force: true });
});

test('19 force preserves unrelated files while adding the template', async () => {
  const d = await temp();
  await writeFile(join(d, 'keep.txt'), 'x');
  await createProject({ targetDirectory: d, force: true });

  assert.equal(await readFile(join(d, 'keep.txt'), 'utf8'), 'x');
  assert.ok((await readdir(d)).includes('server.ts'));

  await rm(d, { recursive: true, force: true });
});

test('20 template file listing is deterministic', async () => {
  const files = await templateFiles();
  assert.deepEqual(files, [...files].sort());
});

test('21 generated project contains no unresolved template tokens', async () => {
  const { base, target } = await generated({
    projectName: 'Resolved',
    packageName: 'resolved',
    port: 3333,
  });

  const candidates = [
    'package.json',
    '.env.example',
    'src/index.tsx',
    'src/app/components/FooterComponent.tsx',
    'src/app/components/NavigationBarComponent.tsx',
    'src/app/routes.ts',
  ];

  for (const file of candidates) {
    assert.doesNotMatch(
      await readFile(join(target, file), 'utf8'),
      /__PROJECT_NAME__|__PACKAGE_NAME__|__PORT__/,
    );
  }

  await rm(base, { recursive: true, force: true });
});

test('22 migration filename follows the requested timestamp convention', async () => {
  const files = await templateFiles();
  assert.ok(files.includes('migrations/09052026_153324_create_users.ts'));
});
