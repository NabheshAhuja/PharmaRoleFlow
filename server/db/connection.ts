import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "../db";

// PostgreSQL session store for session persistence
const PostgresSessionStore = connectPg(session);

/**
 * Database connection manager class
 * Handles pool creation and session store initialization
 */
export class DatabaseConnection {
  sessionStore: session.Store;

  constructor() {
    // Initialize PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
      tableName: 'session'
    });
    console.log("PostgreSQL session store initialized");
  }

  /**
   * Get the database connection pool
   */
  getPool() {
    return pool;
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
    await pool.end();
    console.log("PostgreSQL pool closed");
  }
}

// Create and export a singleton instance
export const dbConnection = new DatabaseConnection();