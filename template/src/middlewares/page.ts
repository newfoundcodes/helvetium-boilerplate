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
