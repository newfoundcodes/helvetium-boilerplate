import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const assets = join(root, 'public', 'assets');

await Promise.all(
  ['dist', 'coverage'].map((entry) => rm(join(root, entry), { recursive: true, force: true })),
);

for (const entry of await readdir(assets).catch(() => [])) {
  if (/^(?:.*\.js(?:\.map)?|app\.css|manifest\.json)$/.test(entry)) {
    await rm(join(assets, entry), { force: true });
  }
}
