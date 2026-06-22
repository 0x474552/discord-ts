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
  private connecting: Promise<void> | null = null;

  constructor(
    private readonly name: string,
    private readonly options: DatabaseConnectionOptions,
  ) {}

  async connect(): Promise<void> {
    if (this.pool) {
      return;
    }

    // Prevent concurrent connect() calls
    if (this.connecting) {
      return this.connecting;
    }

    this.connecting = this._connect();
    await this.connecting;
    this.connecting = null;
  }

  // move original connect logic here
  private async _connect(): Promise<void> {
    const poolOptions: PoolOptions = {
      host: this.options.host,
      port: this.options.port,
      user: this.options.user,
      password: this.options.password,
      database: this.options.database,
      connectionLimit: this.options.connectionLimit ?? 10,
      waitForConnections: true,
      queueLimit: 0,

      // optional additions
      connectTimeout: 10_000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
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
      // simplify this healthcheck
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  // async query<T extends RowDataPacket[]>(sql: string, params: unknown[] = []): Promise<T> {
  async query<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
    if (!this.pool) {
      throw new Error(`Database "${this.name}" is not connected.`);
    }

    try {
      const [rows] = await this.pool.query(sql, params);
      return rows as T[];
    } catch (err) {
      // add query error logging
      log.error(`Query failed in database "${this.name}"`, 'database', {
        sql,
        params,
        err
      });
      throw err;
    }
  }

  async close(): Promise<void> {
    if (!this.pool) return;

    await this.pool.end(); 

    this.pool = null;

    log.info(`Closed database pool "${this.name}"`, 'database');
  }
}
