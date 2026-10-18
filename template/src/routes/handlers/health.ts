import type { BootContext } from '@newfoundcodes/helvetium-boot';
import { database } from '../../database/index.js';

export async function healthHandler(c: BootContext) {
  const databases = await database().health();
  const ok = Object.values(databases).every((x) => x.ok);

  return c.json(
    { ok, service: '__PACKAGE_NAME__', time: new Date().toISOString(), databases },
    ok ? 200 : 503,
  );
}
