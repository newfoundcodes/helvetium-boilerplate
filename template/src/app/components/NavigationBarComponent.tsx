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

import { Anchor, h } from '@newfoundcodes/helvetium-dom';

export function NavigationBarComponent() {
  return (
    <nav
      class="max-w-[1100px] w-full px-4 mx-auto flex items-center justify-between py-4"
      aria-label="Primary"
    >
      <strong>__PROJECT_NAME__</strong>
      <div class="flex gap-4">
        <Anchor to="/" class="hover:font-bold">
          Home
        </Anchor>
        <Anchor to="/about" class="hover:font-bold">
          About
        </Anchor>
      </div>
    </nav>
  );
}
