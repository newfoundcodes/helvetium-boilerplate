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

export type { BoilerplateManifest } from './interfaces/manifest.js';
import type { BoilerplateManifest } from './interfaces/manifest.js';

export const manifest: BoilerplateManifest = Object.freeze({
  version: '0.1.0',
  framework: {
    boot: '0.1.2',
    dom: '0.1.2',
    alps: '0.1.0',
    apiary: '0.1.1',
    mcp: '0.1.1',
  },
  defaultPort: 3000,
  directories: [
    'src/app/components',
    'src/routes/handlers',
    'src/middlewares',
    'src/config',
    'src/database/repositories',
    'src/database/tables',
    'migrations',
    'public/assets',
    'scripts',
    'tests',
  ],
});
