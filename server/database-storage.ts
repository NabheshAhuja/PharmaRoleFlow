import { IStorage } from "./storage";
import { 
  UserRole, UserStatus, OrganizationType, 
  type User, type InsertUser, type Organization, type InsertOrganization, 
  type Activity, type InsertActivity, type UserRoleType, type UserStatusType, type OrganizationTypeType 
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { createHash } from "crypto";
import * as pg from 'pg'
import dotenv from 'dotenv';
const { Pool } = pg
// PostgreSQL session store for session persistence
const PostgresSessionStore = connectPg(session);

// Helper to hash passwords consistently
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

/**
 * PostgreSQL implementation of the storage interface
 */
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  private pool: Pool;

  constructor() {
    dotenv.config();
    
    // Create a new PostgreSQL pool if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      this.pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      });
    } else {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Initialize PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({ 
      pool: this.pool,
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  // ====== USER METHODS ======

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      // Convert snake_case column names to camelCase
      return this.mapUserFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return this.mapUserFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      throw error;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const { 
        username, password, fullName, email, role, 
        status = UserStatus.ACTIVE, organizationId, 
        region, state, city, pincode, address, managerId 
      } = userData;
      
      const result = await this.pool.query(
        `INSERT INTO users (
          username, password, full_name, email, 
          role, status, organization_id, region, 
          state, city, pincode, address, manager_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        RETURNING *`,
        [
          username, password, fullName, email, 
          role, status, organizationId, region, 
          state, city, pincode, address, managerId
        ]
      );
      
      return this.mapUserFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      // Build SET parts and values
      const setClauses = [];
      const values = [];
      let paramCount = 1;
      
      if (userData.username !== undefined) {
        setClauses.push(`username = $${paramCount++}`);
        values.push(userData.username);
      }
      
      if (userData.password !== undefined) {
        setClauses.push(`password = $${paramCount++}`);
        values.push(userData.password);
      }
      
      if (userData.fullName !== undefined) {
        setClauses.push(`full_name = $${paramCount++}`);
        values.push(userData.fullName);
      }
      
      if (userData.email !== undefined) {
        setClauses.push(`email = $${paramCount++}`);
        values.push(userData.email);
      }
      
      if (userData.role !== undefined) {
        setClauses.push(`role = $${paramCount++}`);
        values.push(userData.role);
      }
      
      if (userData.status !== undefined) {
        setClauses.push(`status = $${paramCount++}`);
        values.push(userData.status);
      }
      
      if (userData.organizationId !== undefined) {
        setClauses.push(`organization_id = $${paramCount++}`);
        values.push(userData.organizationId);
      }
      
      if (userData.region !== undefined) {
        setClauses.push(`region = $${paramCount++}`);
        values.push(userData.region);
      }
      
      if (userData.state !== undefined) {
        setClauses.push(`state = $${paramCount++}`);
        values.push(userData.state);
      }
      
      if (userData.city !== undefined) {
        setClauses.push(`city = $${paramCount++}`);
        values.push(userData.city);
      }
      
      if (userData.pincode !== undefined) {
        setClauses.push(`pincode = $${paramCount++}`);
        values.push(userData.pincode);
      }
      
      if (userData.address !== undefined) {
        setClauses.push(`address = $${paramCount++}`);
        values.push(userData.address);
      }
      
      if (userData.managerId !== undefined) {
        setClauses.push(`manager_id = $${paramCount++}`);
        values.push(userData.managerId);
      }
      
      if (userData.lastLogin !== undefined) {
        setClauses.push(`last_login = $${paramCount++}`);
        values.push(userData.lastLogin);
      }
      
      if (setClauses.length === 0) {
        // No fields to update, return existing user
        return this.getUser(id);
      }
      
      // Add ID parameter
      values.push(id);
      
      const query = `
        UPDATE users 
        SET ${setClauses.join(', ')} 
        WHERE id = $${paramCount}
        RETURNING *
      `;
      
      const result = await this.pool.query(query, values);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return this.mapUserFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await this.pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const result = await this.pool.query('SELECT * FROM users');
      return result.rows.map((row: any) => this.mapUserFromDb(row));
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM users WHERE role = $1',
        [role]
      );
      
      return result.rows.map((row: any) => this.mapUserFromDb(row));
    } catch (error) {
      console.error('Error in getUsersByRole:', error);
      throw error;
    }
  }

  async getUsersByOrganization(organizationId: number): Promise<User[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM users WHERE organization_id = $1',
        [organizationId]
      );
      
      return result.rows.map((row: any) => this.mapUserFromDb(row));
    } catch (error) {
      console.error('Error in getUsersByOrganization:', error);
      throw error;
    }
  }

  async getUsersByManager(managerId: number): Promise<User[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM users WHERE manager_id = $1',
        [managerId]
      );
      
      return result.rows.map((row: any) => this.mapUserFromDb(row));
    } catch (error) {
      console.error('Error in getUsersByManager:', error);
      throw error;
    }
  }

  // ====== ORGANIZATION METHODS ======

  async getOrganization(id: number): Promise<Organization | undefined> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM organizations WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return this.mapOrganizationFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error in getOrganization:', error);
      throw error;
    }
  }

  async createOrganization(orgData: InsertOrganization): Promise<Organization> {
    try {
      const { name, type } = orgData;
      
      const result = await this.pool.query(
        'INSERT INTO organizations (name, type) VALUES ($1, $2) RETURNING *',
        [name, type]
      );
      
      return this.mapOrganizationFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error in createOrganization:', error);
      throw error;
    }
  }

  async updateOrganization(id: number, orgData: Partial<InsertOrganization>): Promise<Organization | undefined> {
    try {
      const setClauses = [];
      const values = [];
      let paramCount = 1;
      
      if (orgData.name !== undefined) {
        setClauses.push(`name = $${paramCount++}`);
        values.push(orgData.name);
      }
      
      if (orgData.type !== undefined) {
        setClauses.push(`type = $${paramCount++}`);
        values.push(orgData.type);
      }
      
      if (setClauses.length === 0) {
        return this.getOrganization(id);
      }
      
      values.push(id);
      
      const query = `
        UPDATE organizations 
        SET ${setClauses.join(', ')} 
        WHERE id = $${paramCount}
        RETURNING *
      `;
      
      const result = await this.pool.query(query, values);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return this.mapOrganizationFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error in updateOrganization:', error);
      throw error;
    }
  }

  async deleteOrganization(id: number): Promise<boolean> {
    try {
      const result = await this.pool.query(
        'DELETE FROM organizations WHERE id = $1 RETURNING id',
        [id]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error in deleteOrganization:', error);
      throw error;
    }
  }

  async getAllOrganizations(): Promise<Organization[]> {
    try {
      const result = await this.pool.query('SELECT * FROM organizations');
      return result.rows.map((row: any) => this.mapOrganizationFromDb(row));
    } catch (error) {
      console.error('Error in getAllOrganizations:', error);
      throw error;
    }
  }

  // ====== ACTIVITY METHODS ======

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    try {
      const { userId, action, description } = activityData;
      
      const result = await this.pool.query(
        'INSERT INTO activities (user_id, action, description) VALUES ($1, $2, $3) RETURNING *',
        [userId, action, description]
      );
      
      return this.mapActivityFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error in createActivity:', error);
      throw error;
    }
  }

  async getActivities(limit?: number): Promise<Activity[]> {
    try {
      let query = 'SELECT * FROM activities ORDER BY timestamp DESC';
      const params = [];
      
      if (limit) {
        query += ' LIMIT $1';
        params.push(limit);
      }
      
      const result = await this.pool.query(query, params);
      return result.rows.map((row: any) => this.mapActivityFromDb(row));
    } catch (error) {
      console.error('Error in getActivities:', error);
      throw error;
    }
  }

  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM activities WHERE user_id = $1 ORDER BY timestamp DESC',
        [userId]
      );
      
      return result.rows.map((row: any) => this.mapActivityFromDb(row));
    } catch (error) {
      console.error('Error in getActivitiesByUser:', error);
      throw error;
    }
  }

  // ====== HELPER METHODS ======

  // Convert DB object to User type
  private mapUserFromDb(dbUser: any): User {
    return {
      id: dbUser.id,
      username: dbUser.username,
      password: dbUser.password,
      fullName: dbUser.full_name,
      email: dbUser.email,
      role: dbUser.role as UserRoleType,
      status: dbUser.status as UserStatusType,
      organizationId: dbUser.organization_id || null,
      region: dbUser.region || null,
      state: dbUser.state || null,
      city: dbUser.city || null,
      pincode: dbUser.pincode || null,
      address: dbUser.address || null,
      managerId: dbUser.manager_id || null,
      lastLogin: dbUser.last_login || null
    };
  }

  // Convert DB object to Organization type
  private mapOrganizationFromDb(dbOrg: any): Organization {
    return {
      id: dbOrg.id,
      name: dbOrg.name,
      type: dbOrg.type as OrganizationTypeType
    };
  }

  // Convert DB object to Activity type
  private mapActivityFromDb(dbActivity: any): Activity {
    return {
      id: dbActivity.id,
      userId: dbActivity.user_id || null,
      action: dbActivity.action,
      description: dbActivity.description,
      timestamp: dbActivity.timestamp
    };
  }

  // ====== INITIALIZATION ======

  // Initialize the database with required data
  async initializeDatabase(): Promise<void> {
    try {
      // Check if we need to initialize (no organizations exist)
      const result = await this.pool.query('SELECT COUNT(*) FROM organizations');
      if (parseInt(result.rows[0].count) > 0) {
        console.log('Database already initialized, skipping...');
        return;
      }

      console.log('Initializing database with default data...');

      // Create System organization
      const orgResult = await this.pool.query(
        'INSERT INTO organizations (name, type) VALUES ($1, $2) RETURNING *',
        ['System Administration', OrganizationType.SYSTEM]
      );
      
      const systemOrg = this.mapOrganizationFromDb(orgResult.rows[0]);

      // Create admin user
      await this.pool.query(
        `INSERT INTO users (
          username, password, full_name, email, 
          role, status, organization_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          'admin',
          hashPassword('admin'),
          'Admin User',
          'admin@example.com',
          UserRole.SUPER_ADMIN,
          UserStatus.ACTIVE,
          systemOrg.id
        ]
      );

      console.log('Database initialized with admin user and system organization');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }
}