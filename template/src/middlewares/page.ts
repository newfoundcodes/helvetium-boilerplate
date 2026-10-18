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

import {
  bodyLimit,
  compress,
  csrf,
  etag,
  logger,
  rateLimit,
  requestId,
  secureHeaders,
  timing,
  type Middleware,
} from '@newfoundcodes/helvetium-boot';
import type { Environment } from '../config/env.js';
import type { Logger } from '../config/logger.js';

export function pageMiddleware(log: Logger, env: Environment): Middleware[] {
  return [
    requestId(),
    timing(),
    logger({
      log(_message, details) {
        log.info('http.request', details);
      },
    }),
    rateLimit({ limit: 300, windowMs: 60_000 }),
    bodyLimit(1024 * 1024),
    csrf({ origin: env.APP_ORIGIN }),
    secureHeaders({
      contentSecurityPolicy:
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'",
    }),
    etag(),
    compress({ threshold: 1024 }),
  ];
}
