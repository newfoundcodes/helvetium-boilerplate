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

import { createApp, type Middleware } from '@newfoundcodes/helvetium-boot';
import fs from 'node:fs';
import path from 'node:path';
import { describeRoute, openAPIRouteHandler } from '@newfoundcodes/helvetium-boot/openapi';
import { helvetiumPages } from '@newfoundcodes/helvetium-boot/helvetium-dom';
import { h } from '@newfoundcodes/helvetium-dom';
import { NotFoundPage } from '../app/NotFoundPage.js';
import { pageRoutes } from '../app/routes.js';
import { Index } from '../index.js';
__IMPORT_MCP__;
__ALPS_IMPORTS__;

export interface ApplicationMiddleware {
  path?: string;
  handler: Middleware;
}

export function createApplication(options: { middleware?: ApplicationMiddleware[] } = {}) {
  const app = createApp();

  for (const item of options.middleware ?? []) {
    if (item.path) {
      app.use(item.path, item.handler);
    } else {
      app.use(item.handler);
    }
  }

  __ALPS_ROUTES__;

  app.get(
    '/openapi.json',
    describeRoute({ hide: true }),
    openAPIRouteHandler(app, {
      info: { title: '__PROJECT_NAME__ API', version: '0.1.0' },
      pretty: 2,
      cacheControl: 'no-store',
    }),
  );

  __INIT_MCP__;

  let clientEntry = '/assets/client.js';
  try {
    const manifestPath = path.resolve(process.cwd(), 'public/assets/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    if (manifest.client) {
      clientEntry = manifest.client;
    }
  } catch {}

  app.use(
    helvetiumPages(h(Index, null), {
      routes: pageRoutes,
      notFound: NotFoundPage,
      clientEntry,
    }),
  );

  return app;
}

export { pageRoutes } from '../app/routes.js';
