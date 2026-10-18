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

import { access, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { manifest } from './manifest.js';

import type { PackageManager } from './types/index.js';
import type { CreateProjectOptions, ProjectPlan, CreateProjectResult } from './interfaces/index.js';

const TOKEN_RE = /__(PROJECT_NAME|PACKAGE_NAME|PORT)__/g;
const RENAMES: Record<string, string> = {
  _gitignore: '.gitignore',
  _dockerignore: '.dockerignore',
  '_env.example': '.env.example',
  '_env.test': '.env.test',
  _github: ' .github',
};

function templateRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), '../template');
}

export function validatePackageName(name: string): boolean {
  return /^(?:@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*|[a-z0-9][a-z0-9._-]*)$/.test(name);
}

function slug(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'helvetium-app'
  );
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dir: string, prefix = ''): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      out.push(...(await listFiles(join(dir, entry.name), rel)));
    } else {
      out.push(rel);
    }
  }

  return out.sort();
}

function outputPath(relative: string): string {
  return relative
    .split('/')
    .map((part) => (part === '_github' ? '.github' : (RENAMES[part]?.trim() ?? part)))
    .join('/');
}

function render(value: string, plan: ProjectPlan): string {
  let rendered = value.replace(TOKEN_RE, (_, key: string) =>
    key === 'PROJECT_NAME'
      ? plan.projectName
      : key === 'PACKAGE_NAME'
        ? plan.packageName
        : String(plan.port),
  );

  const dependencies: string[] = [
    ...(plan.useAlps
      ? [
          `"@newfoundcodes/helvetium-alps": "^${manifest.framework.alps}"`,
          '"better-sqlite3": "^13.0.3"',
        ]
      : []),
    ...(plan.useApiary
      ? [`"@newfoundcodes/helvetium-apiary": "^${manifest.framework.apiary}"`]
      : []),
    `"@newfoundcodes/helvetium-boot": "^${manifest.framework.boot}"`,
    `"@newfoundcodes/helvetium-dom": "^${manifest.framework.dom}"`,
    ...(plan.useMcp ? [`"@newfoundcodes/helvetium-mcp": "^${manifest.framework.mcp}"`] : []),
  ];

  const migrationScripts = plan.useAlps
    ? [
        '"migrate": "tsx scripts/migrate.ts up"',
        '"migrate:down": "tsx scripts/migrate.ts down"',
        '"migrate:status": "tsx scripts/migrate.ts status"',
      ].join(',\n    ') + ','
    : '';

  // Clean up server.ts and paths.ts tokens
  const replacementMap: Record<string, string> = {
    __DEPENDENCIES__: dependencies.join(',\n    '),
    __ALPS_SCRIPTS__: migrationScripts,
    __IMPORT_ALPS__: plan.useAlps
      ? `import { closeDatabase, createDatabase } from './src/database/index.js';`
      : '',
    __INIT_ALPS__: plan.useAlps ? `createDatabase(env);` : '',
    __CLOSE_ALPS__: plan.useAlps ? `await closeDatabase();` : '',
    __IMPORT_APIARY__: plan.useApiary ? `import './background/index.js';` : '',
    __IMPORT_MCP__: plan.useMcp
      ? `import { createMCPServer, mountMCP } from '@newfoundcodes/helvetium-mcp';\nimport pingTool from './mcp/ping.js';`
      : '',
    __INIT_MCP__: plan.useMcp
      ? `\n\n  const mcp = createMCPServer({ name: '${plan.packageName}-mcp', version: '0.1.0' });\n  mcp.tool('ping', pingTool());\n  mountMCP(app, mcp, { path: '/mcp' });`
      : '',
    __ALPS_IMPORTS__: plan.useAlps
      ? "import { healthHandler } from './handlers/health.js';\nimport { createUser, listUsers, showUser } from './handlers/users.js';"
      : '',
    __ALPS_ROUTES__: plan.useAlps
      ? `  app.get(
    '/api/health',
    describeRoute({
      operationId: 'health',
      tags: ['system'],
      responses: { 200: { description: 'Healthy' }, 503: { description: 'Dependency failure' } },
    }),
    healthHandler,
  );

  app.get(
    '/api/users',
    describeRoute({
      operationId: 'listUsers',
      tags: ['users'],
      responses: { 200: { description: 'Users' } },
    }),
    listUsers,
  );

  app.get(
    '/api/users/:id',
    describeRoute({
      operationId: 'showUser',
      tags: ['users'],
      responses: { 200: { description: 'User' }, 404: { description: 'Not found' } },
    }),
    showUser,
  );

  app.post(
    '/api/users',
    describeRoute({
      operationId: 'createUser',
      tags: ['users'],
      responses: { 201: { description: 'Created' }, 422: { description: 'Invalid input' } },
    }),
    createUser,
  );

`
      : '',
    __ALPS_README_START__: plan.useAlps ? 'npm run migrate\n' : '',
    __ALPS_README_DESCRIPTION__: plan.useAlps
      ? ', and persistence/migrations use Helvetium Alps'
      : '',
    __ALPS_README_FILES__: plan.useAlps
      ? '- `src/database/`: Alps configuration, table schemas, repositories.\n- `migrations/`: ordered Alps migrations.\n- `scripts/migrate.ts`: migration runner.\n'
      : '',
    __ALPS_README_COMMANDS__: plan.useAlps
      ? ', `migrate`, `migrate:down`, and `migrate:status`'
      : '',
    __ALPS_DOCKER_COPY__: plan.useAlps ? 'COPY --from=build /app/migrations ./migrations' : '',
  };

  for (const [token, replacement] of Object.entries(replacementMap)) {
    rendered = rendered.split(token).join(replacement);
  }

  // Remove empty lines created by replacements, but only if they consist of exactly the token line
  return rendered.replace(/^[ \t]*\n/gm, '\n');
}

export async function planProject(options: CreateProjectOptions): Promise<ProjectPlan> {
  const target = resolve(options.targetDirectory);
  const projectName = options.projectName?.trim() || basename(target);
  const packageName = options.packageName?.trim() || slug(projectName);

  if (!validatePackageName(packageName)) {
    throw new TypeError(`Invalid npm package name: ${packageName}`);
  }

  const port = options.port ?? manifest.defaultPort;
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new RangeError(`Invalid port: ${String(port)}`);
  }

  let files = (await listFiles(templateRoot())).map(outputPath).sort();
  const useAlps = options.useAlps ?? true;
  const useApiary = options.useApiary ?? true;
  const useMcp = options.useMcp ?? true;

  if (!useAlps) {
    files = files.filter(
      (f) =>
        !f.startsWith('src/database/') &&
        f !== 'src/routes/handlers/health.ts' &&
        f !== 'src/routes/handlers/users.ts' &&
        f !== 'scripts/migrate.ts' &&
        !f.startsWith('migrations/'),
    );
  }

  if (!useApiary) {
    files = files.filter((f) => !f.startsWith('background/'));
  }

  if (!useMcp) {
    files = files.filter((f) => !f.startsWith('src/routes/mcp/'));
  }

  return {
    targetDirectory: target,
    projectName,
    packageName,
    port,
    files,
    useAlps,
    useApiary,
    useMcp,
  };
}

async function assertWritableTarget(target: string, force: boolean): Promise<void> {
  if (!(await exists(target))) {
    return;
  }

  const s = await stat(target);
  if (!s.isDirectory()) {
    throw new Error(`Target exists and is not a directory: ${target}`);
  }

  const entries = await readdir(target);
  if (entries.length && !force) {
    throw new Error(
      `Target directory is not empty: ${target}. Pass force:true to overwrite template paths.`,
    );
  }
}

async function copyRendered(
  sourceRoot: string,
  targetRoot: string,
  plan: ProjectPlan,
): Promise<void> {
  for (const rel of await listFiles(sourceRoot)) {
    const outRel = outputPath(rel);
    if (!plan.files.includes(outRel)) {
      continue;
    }

    const source = join(sourceRoot, ...rel.split('/')),
      target = join(targetRoot, ...outRel.split('/'));
    await mkdir(dirname(target), { recursive: true });

    const data = await readFile(source);
    const binary = data.includes(0);

    if (binary) {
      await writeFile(target, data);
    } else {
      await writeFile(target, render(data.toString('utf8'), plan));
    }
  }
}

function installCommand(manager: PackageManager): { cmd: string; args: string[] } {
  return manager === 'npm'
    ? { cmd: 'npm', args: ['install'] }
    : manager === 'yarn'
      ? { cmd: 'yarn', args: [] }
      : manager === 'bun'
        ? { cmd: 'bun', args: ['install'] }
        : { cmd: 'pnpm', args: ['install'] };
}

async function runInstall(directory: string, manager: PackageManager): Promise<void> {
  if (!['npm', 'pnpm', 'yarn', 'bun'].includes(manager)) {
    throw new TypeError(`Unsupported package manager: ${String(manager)}`);
  }

  const c = installCommand(manager);
  await new Promise<void>((resolvePromise, reject) => {
    const child = spawn(c.cmd, c.args, {
      cwd: directory,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolvePromise() : reject(new Error(`${c.cmd} exited with code ${code}`)),
    );
  });
}

export async function createProject(options: CreateProjectOptions): Promise<CreateProjectResult> {
  const plan = await planProject(options);
  await assertWritableTarget(plan.targetDirectory, options.force ?? false);
  await mkdir(plan.targetDirectory, { recursive: true });
  await copyRendered(templateRoot(), plan.targetDirectory, plan);

  let installed = false;
  if (options.install) {
    await runInstall(plan.targetDirectory, options.packageManager ?? 'npm');
    installed = true;
  }

  return { ...plan, installed };
}

export async function templateFiles(): Promise<string[]> {
  return (await listFiles(templateRoot())).map(outputPath).sort();
}

export { manifest } from './manifest.js';

export type { PackageManager } from './types/index.js';
export type { CreateProjectOptions, ProjectPlan, CreateProjectResult } from './interfaces/index.js';
