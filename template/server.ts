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
