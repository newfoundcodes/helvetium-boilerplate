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

import { Fragment, h, type VNodeChild } from '@newfoundcodes/helvetium-dom';
import { FooterComponent } from './app/components/FooterComponent.js';
import { NavigationBarComponent } from './app/components/NavigationBarComponent.js';

export function Index({ children }: { children?: VNodeChild }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="A production-ready Helvetium application" />
        <link rel="stylesheet" href="/assets/app.css" />
        <title>__PROJECT_NAME__</title>
      </head>
      <body class="bg-neutral-50 text-neutral-900 m-0">
        <div class="min-h-screen grid grid-rows-[auto_1fr_auto]">
          <NavigationBarComponent />
          {children}
          <FooterComponent />
        </div>
      </body>
    </html>
  );
}
