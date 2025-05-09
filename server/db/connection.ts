import { Pool } from "pg";
import session from "express-session";
import connectPg from "connect-pg-simple";

// PostgreSQL session store for session persistence
const PostgresSessionStore = connectPg(session);

/**
 * Database connection manager class
 * Handles pool creation and session store initialization
 */
export class DatabaseConnection {
  pool: Pool;
  sessionStore: session.Store;

  constructor() {
    // Create a new PostgreSQL pool if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      this.pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      });
      console.log("PostgreSQL pool created successfully");
    } else {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Initialize PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({ 
      pool: this.pool,
      createTableIfMissing: true,
      tableName: 'session'
    });
    console.log("PostgreSQL session store initialized");
  }

  /**
   * Get the database connection pool
   */
  getPool(): Pool {
    return this.pool;
  }

  /**
   * Get the session store
   */
  getSessionStore(): session.Store {
    return this.sessionStore;
  }

  /**
   * Close the database connection pool
   */
  async close(): Promise<void> {
    await this.pool.end();
    console.log("PostgreSQL pool closed");
  }
}

// Create and export a singleton instance
export const dbConnection = new DatabaseConnection();