import { serve, serveStatic } from '@newfoundcodes/helvetium-boot/node';
import { createLogger } from './src/config/logger.js';
import { loadEnvironment } from './src/config/env.js';
__IMPORT_ALPS__;
__IMPORT_APIARY__;
import { pageMiddleware } from './src/middlewares/page.js';
import { createApplication, type ApplicationMiddleware } from './src/routes/paths.js';

const env = loadEnvironment();
const log = createLogger(env.LOG_LEVEL);
__INIT_ALPS__;

const middleware: ApplicationMiddleware[] = [
  ...pageMiddleware(log, env).map((handler) => ({ handler })),
  { handler: serveStatic('./public', { maxAge: env.NODE_ENV === 'production' ? 86_400_000 : 0 }) },
];

const app = createApplication({ middleware });
const handle = serve({
  app,
  hostname: env.HOST,
  port: env.PORT,
  trustProxy: env.TRUST_PROXY,
  requestTimeout: 30_000,
  headersTimeout: 30_000,
  keepAliveTimeout: 5_000,
});

await handle.ready;
log.info('server.started', { url: handle.url, environment: env.NODE_ENV });

let closing = false;
async function shutdown(signal: string) {
  if (closing) {
    return;
  }

  closing = true;
  log.info('server.stopping', { signal });

  await handle.close();
  __CLOSE_ALPS__;

  log.info('server.stopped');
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void shutdown(signal)
      .then(() => process.exit(0))
      .catch((error) => {
        log.error('server.shutdown_failed', error);
        process.exit(1);
      });
  });
}
