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
  Repository,
  createTableSql,
  defineTable,
  dialect,
  types,
  type MigrationRecord,
  type MigrationStateStore,
  type SqlDatabase,
} from '@newfoundcodes/helvetium-alps';

interface MigrationRow extends Record<string, unknown> {
  id: string;
  appliedAt: string;
  batch: number;
  checksum: string | null;
}

const migrationsTable = defineTable<MigrationRow>('__helvetium_migrations', {
  id: types.string(255, { primaryKey: true }),
  appliedAt: types.datetime(),
  batch: types.integer(),
  checksum: types.string(255, { nullable: true }),
});

export class SqlMigrationStateStore implements MigrationStateStore {
  private initialized = false;
  private readonly repository: Repository<MigrationRow>;

  constructor(private readonly db: SqlDatabase) {
    this.repository = new Repository(db, migrationsTable, { primaryKey: 'id' });
  }

  private async ensure(): Promise<void> {
    if (this.initialized) {
      return;
    }

    for (const statement of createTableSql(migrationsTable, dialect(this.db.adapter.dialect), {
      ifNotExists: true,
    })) {
      await this.db.query(statement);
    }

    this.initialized = true;
  }

  async list(): Promise<MigrationRecord[]> {
    await this.ensure();

    const rows = await this.repository.findMany({ orderBy: 'appliedAt', direction: 'asc' });
    return rows.map((row) => ({
      id: row.id,
      appliedAt: String(row.appliedAt),
      batch: Number(row.batch),
      ...(row.checksum ? { checksum: row.checksum } : {}),
    }));
  }

  async add(record: MigrationRecord): Promise<void> {
    await this.ensure();
    await this.repository.create({
      id: record.id,
      appliedAt: record.appliedAt,
      batch: record.batch,
      checksum: record.checksum ?? null,
    });
  }

  async remove(id: string): Promise<void> {
    await this.ensure();
    await this.repository.deleteById(id, { force: true });
  }
}
