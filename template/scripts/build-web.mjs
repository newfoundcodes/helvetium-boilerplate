import { build } from 'esbuild';
import fs from 'node:fs/promises';

const result = await build({
  entryPoints: ['src/web.ts'],
  outdir: 'public/assets',
  entryNames: '[hash]',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2022'],
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
  jsx: 'automatic',
  jsxImportSource: '@newfoundcodes/helvetium-dom',
  define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production') },
  logLevel: 'info',
  metafile: true,
});

const outputs = Object.keys(result.metafile.outputs);
const jsFile = outputs.find((f) => f.endsWith('.js'));

if (jsFile) {
  const clientPath = '/' + jsFile.split('/').slice(1).join('/');
  await fs.writeFile('public/assets/manifest.json', JSON.stringify({ client: clientPath }));
}
