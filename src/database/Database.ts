import mysql, { type Pool, type PoolOptions, type RowDataPacket } from 'mysql2/promise';
import { log } from '../utils/logger';

export interface DatabaseConnectionOptions {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit?: number;
}

/**
 * Minimal pooled MySQL connection for starter projects.
 * Keep this small and predictable so new bot projects can extend it easily.
 */
export class Database {
  private pool: Pool | null = null;

  constructor(
    private readonly name: string,
    private readonly options: DatabaseConnectionOptions,
  ) {}

  async connect(): Promise<void> {
    if (this.pool) {
      return;
    }

    const poolOptions: PoolOptions = {
      host: this.options.host,
      port: this.options.port,
      user: this.options.user,
      password: this.options.password,
      database: this.options.database,
      connectionLimit: this.options.connectionLimit ?? 10,
      waitForConnections: true,
      queueLimit: 0,
    };

    // A pooled connection is a safer default than a single shared connection
    // for most Discord bot workloads.
    this.pool = mysql.createPool(poolOptions);
    const connection = await this.pool.getConnection();
    await connection.ping();
    connection.release();
    log.success(`Connected to database pool "${this.name}".`, 'database');
  }

  async healthy(): Promise<boolean> {
    if (!this.pool) {
      return false;
    }

    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      return true;
    } catch {
      return false;
    }
  }

  async query<T extends RowDataPacket[]>(sql: string, params: unknown[] = []): Promise<T> {
    if (!this.pool) {
      throw new Error(`Database "${this.name}" is not connected.`);
    }

    // Keep starter queries parameterized by default.
    const [rows] = await this.pool.query<T>(sql, params);
    return rows;
  }

  async close(): Promise<void> {
    await this.pool?.end();
    this.pool = null;
    log.info(`Closed database pool "${this.name}".`, 'database');
  }
}
