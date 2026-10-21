import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const testPattern = /\.test\.(?:c|m)?(?:js|ts|tsx|jsx)$/;

async function collectTests(directory) {
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTests(path)));
    } else if (testPattern.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

const files = (await collectTests(join(root, 'tests'))).sort();
if (!files.length) {
  console.error('No test files found under tests/.');
  process.exitCode = 1;
} else {
  const forwarded = process.argv.slice(2);
  const coverage = forwarded.includes('--coverage');
  const args = ['--test', '--import', 'tsx'];

  if (coverage) {
    args.push('--experimental-test-coverage');
  }

  args.push(...forwarded.filter((argument) => argument !== '--coverage'), ...files);

  const code = await new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd: root,
      stdio: 'inherit',
    });

    child.on('error', () => resolve(1));
    child.on('exit', (exitCode) => resolve(exitCode ?? 1));
  });

  process.exitCode = code;
}
