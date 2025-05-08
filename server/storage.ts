import { UserRole, UserStatus, OrganizationType, users, organizations, activities, type User, type InsertUser, type Organization, type InsertOrganization, type Activity, type InsertActivity } from "@shared/schema";
import session from "express-session";
import { createHash } from "crypto";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from './db';

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  getUsersByOrganization(organizationId: number): Promise<User[]>;
  getUsersByManager(managerId: number): Promise<User[]>;
  
  // Organization management
  getOrganization(id: number): Promise<Organization | undefined>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  updateOrganization(id: number, organization: Partial<InsertOrganization>): Promise<Organization | undefined>;
  deleteOrganization(id: number): Promise<boolean>;
  getAllOrganizations(): Promise<Organization[]>;
  
  // Activity tracking
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivities(limit?: number): Promise<Activity[]>;
  getActivitiesByUser(userId: number): Promise<Activity[]>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      tableName: 'session',
      createTableIfMissing: true 
    });
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Check if we have any organizations
      const result = await db.execute(sql`SELECT COUNT(*) FROM organizations`);
      const count = parseInt(result.rows[0].count);
      
      if (count === 0) {
        console.log("Initializing database with default data...");
        
        // Create system organization
        const [systemOrg] = await db.insert(organizations).values({
          name: "System Administration",
          type: "SYSTEM"
        }).returning();
        
        // Create admin user
        await db.insert(users).values({
          username: "admin",
          password: this.hashPassword("admin"),
          fullName: "Admin User",
          email: "admin@example.com",
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          organizationId: systemOrg.id
        });
        
        console.log("Database initialized with admin user and system organization");
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.execute(sql`SELECT * FROM users WHERE id = ${id}`);
      return result.rows[0] as User | undefined;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.execute(sql`SELECT * FROM users WHERE username = ${username}`);
      return result.rows[0] as User | undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      // Handle optional fields
      const columns = Object.keys(user).filter(key => user[key as keyof InsertUser] !== undefined);
      const values = columns.map(key => user[key as keyof InsertUser]);
      
      // Create the SQL query dynamically
      const columnsStr = columns.join(', ');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      
      const query = `INSERT INTO users (${columnsStr}) VALUES (${placeholders}) RETURNING *`;
      const result = await db.execute(sql.raw(query), ...values);
      
      return result.rows[0] as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      // Filter out undefined values and create SET clauses
      const updateColumns = Object.keys(userData)
        .filter(key => userData[key as keyof Partial<InsertUser>] !== undefined)
        .map((key, index) => `${key} = $${index + 2}`);
      
      if (updateColumns.length === 0) {
        // Nothing to update
        return this.getUser(id);
      }
      
      const values = Object.values(userData).filter(value => value !== undefined);
      const query = `UPDATE users SET ${updateColumns.join(', ')} WHERE id = $1 RETURNING *`;
      
      const result = await db.execute(sql.raw(query), id, ...values);
      return result.rows[0] as User;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await db.execute(sql`DELETE FROM users WHERE id = ${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const result = await db.execute(sql`SELECT * FROM users`);
      return result.rows as User[];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const result = await db.execute(sql`SELECT * FROM users WHERE role = ${role}`);
      return result.rows as User[];
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }

  async getUsersByOrganization(organizationId: number): Promise<User[]> {
    try {
      const result = await db.execute(sql`SELECT * FROM users WHERE organization_id = ${organizationId}`);
      return result.rows as User[];
    } catch (error) {
      console.error('Error getting users by organization:', error);
      return [];
    }
  }

  async getUsersByManager(managerId: number): Promise<User[]> {
    try {
      const result = await db.execute(sql`SELECT * FROM users WHERE manager_id = ${managerId}`);
      return result.rows as User[];
    } catch (error) {
      console.error('Error getting users by manager:', error);
      return [];
    }
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    try {
      const result = await db.execute(sql`SELECT * FROM organizations WHERE id = ${id}`);
      return result.rows[0] as Organization | undefined;
    } catch (error) {
      console.error('Error getting organization:', error);
      return undefined;
    }
  }

  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    try {
      // Create dynamic SQL for inserting
      const columns = Object.keys(organization);
      const values = Object.values(organization);
      
      const columnsStr = columns.join(', ');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      
      const query = `INSERT INTO organizations (${columnsStr}) VALUES (${placeholders}) RETURNING *`;
      const result = await db.execute(sql.raw(query), ...values);
      
      return result.rows[0] as Organization;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }

  async updateOrganization(id: number, organization: Partial<InsertOrganization>): Promise<Organization | undefined> {
    try {
      const updateColumns = Object.keys(organization)
        .map((key, index) => `${key} = $${index + 2}`);
      
      if (updateColumns.length === 0) {
        return this.getOrganization(id);
      }
      
      const values = Object.values(organization);
      const query = `UPDATE organizations SET ${updateColumns.join(', ')} WHERE id = $1 RETURNING *`;
      
      const result = await db.execute(sql.raw(query), id, ...values);
      return result.rows[0] as Organization;
    } catch (error) {
      console.error('Error updating organization:', error);
      return undefined;
    }
  }

  async deleteOrganization(id: number): Promise<boolean> {
    try {
      await db.execute(sql`DELETE FROM organizations WHERE id = ${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting organization:', error);
      return false;
    }
  }

  async getAllOrganizations(): Promise<Organization[]> {
    try {
      const result = await db.execute(sql`SELECT * FROM organizations`);
      return result.rows as Organization[];
    } catch (error) {
      console.error('Error getting all organizations:', error);
      return [];
    }
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    try {
      const columns = Object.keys(activity);
      columns.push('timestamp'); // Add timestamp
      
      const values = Object.values(activity);
      values.push(new Date()); // Add current date for timestamp
      
      const columnsStr = columns.join(', ');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      
      const query = `INSERT INTO activities (${columnsStr}) VALUES (${placeholders}) RETURNING *`;
      const result = await db.execute(sql.raw(query), ...values);
      
      return result.rows[0] as Activity;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  async getActivities(limit?: number): Promise<Activity[]> {
    try {
      let query = 'SELECT * FROM activities ORDER BY timestamp DESC';
      
      if (limit) {
        query += ` LIMIT ${limit}`;
      }
      
      const result = await db.execute(sql.raw(query));
      return result.rows as Activity[];
    } catch (error) {
      console.error('Error getting activities:', error);
      return [];
    }
  }

  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    try {
      const result = await db.execute(sql`
        SELECT * FROM activities
        WHERE user_id = ${userId}
        ORDER BY timestamp DESC
      `);
      return result.rows as Activity[];
    } catch (error) {
      console.error('Error getting activities by user:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();