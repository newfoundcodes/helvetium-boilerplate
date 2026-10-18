declare module 'better-sqlite3' {
  interface Statement {
    all(...values: unknown[]): unknown[];
    run(...values: unknown[]): { changes: number; lastInsertRowid: number | bigint };
  }

  export default class Database {
    constructor(path: string);
    prepare(sql: string): Statement;
    pragma(value: string): unknown;
    close(): void;
  }
}
