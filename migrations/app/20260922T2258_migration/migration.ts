#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/10b5e7ff1985cd7a0ffdafcab853f8e44fdec565c6c14d0607414b5067a1910c/contract';
import startContract from '../../snapshots/10b5e7ff1985cd7a0ffdafcab853f8e44fdec565c6c14d0607414b5067a1910c/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/539a531cc15f9ff10d0729ea8d9f7d91e605876ee0d70ee8ed72e13e3f99b3cd/contract';
import endContract from '../../snapshots/539a531cc15f9ff10d0729ea8d9f7d91e605876ee0d70ee8ed72e13e3f99b3cd/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropColumn({ schema: 'public', table: 'manager', column: 'createdAt' }),
      this.dropDefault({ schema: 'public', table: 'manager', column: 'hasBonus' }),
      this.createTable({
        schema: 'public',
        table: 'drawRecord',
        columns: [
          col('hasBonus', 'bool', { notNull: true, codecRef: { codecId: 'pg/bool@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('leagueName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('managerName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('teamName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
