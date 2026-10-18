#!/usr/bin/env node
import { createProject } from '../dist/index.js';

const args = process.argv.slice(2);
let target = '.';
let force = false,
  install = false,
  manager = 'npm',
  name,
  packageName,
  port;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--force') {
    force = true;
  } else if (a === '--install') {
    install = true;
  } else if (a === '--name') {
    name = args[++i];
  } else if (a === '--package') {
    packageName = args[++i];
  } else if (a === '--port') {
    port = Number(args[++i]);
  } else if (a === '--pm') {
    manager = args[++i];
  } else if (!a.startsWith('-')) {
    target = a;
  } else if (a === '--help') {
    console.log(
      `helvetium-boilerplate [directory] [--install] [--force] [--name NAME] [--package NAME] [--port PORT] [--pm npm|pnpm|yarn|bun]`,
    );
    process.exit(0);
  }
}

try {
  const r = await createProject({
    targetDirectory: target,
    projectName: name,
    packageName,
    port,
    force,
    install,
    packageManager: manager,
  });

  console.log(`Created ${r.projectName} in ${r.targetDirectory}`);
  if (!r.installed) {
    console.log('Next: cd into the project, run npm install, npm run migrate, then npm run dev.');
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
}
