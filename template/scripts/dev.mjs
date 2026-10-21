import { context } from 'esbuild';
import { spawn } from 'node:child_process';

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const manifestPlugin = {
  name: 'manifest',
  setup(build) {
    build.onEnd(async (result) => {
      if (result.metafile) {
        const outputs = Object.keys(result.metafile.outputs);
        const jsFile = outputs.find((f) => f.endsWith('.js'));

        if (jsFile) {
          const clientPath = '/' + jsFile.split('/').slice(1).join('/');
          const fs = await import('node:fs/promises');

          await fs.writeFile('public/assets/manifest.json', JSON.stringify({ client: clientPath }));
        }
      }
    });
  },
};

const ctx = await context({
  entryPoints: ['src/web.ts'],
  outdir: 'public/assets',
  entryNames: '[hash]',
  metafile: true,
  plugins: [manifestPlugin],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2022'],
  sourcemap: true,
  jsx: 'automatic',
  jsxImportSource: '@newfoundcodes/helvetium-dom',
});
await ctx.watch();

const child = spawn(process.execPath, ['--watch', '--import', 'tsx', 'server.ts'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: process.env.NODE_ENV ?? 'development' },
});

const cssChild = spawn(
  npx,
  ['tailwindcss', '-i', './src/app.css', '-o', './public/assets/app.css', '--watch'],
  {
    stdio: 'inherit',
  },
);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    child.kill(signal);
    cssChild.kill(signal);
  });
}

child.on('exit', async (code) => {
  await ctx.dispose();
  cssChild.kill();

  process.exit(code ?? 0);
});
