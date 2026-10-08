import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pool } from './pool';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

// Migrations are written to be idempotent (IF NOT EXISTS), so re-running them on
// every startup is safe and avoids needing a migration-tracking table.
export async function migrate(): Promise<void> {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    await pool.query(readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8'));
  }
}
