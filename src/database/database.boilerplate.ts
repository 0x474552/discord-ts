import type { RowDataPacket } from 'mysql2/promise';
import { mainDb } from './index';

interface HealthRow extends RowDataPacket {
  ok: number;
}

/**
 * Reference-only repository example showing how you might wrap a query in a
 * reusable function.
 */
export async function checkDatabaseBoilerplate(): Promise<boolean> {
  if (!mainDb) {
    return false;
  }

  const rows = await mainDb.query<HealthRow>('SELECT 1 AS ok');
  return rows[0]?.ok === 1;
}
