import { eq, and, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { 
  UserRole, UserStatus, OrganizationType, users, organizations, activities, 
  type User, type InsertUser, type Organization, type InsertOrganization, 
  type Activity, type InsertActivity 
} from "@shared/schema";
import { db } from "./db";
import { IStorage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { createHash } from "crypto";

// PostgreSQL session store
const PostgresSessionStore = connectPg(session);

// Helper to hash passwords
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Initialize PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  // USER METHODS

  async getUser(id: number): Promise<User | undefined> {
    try {
      const rows = await db.execute(
        sql`SELECT * FROM users WHERE id = ${id}`
      );
      return rows.length > 0 ? rows[0] as User : undefined;
    } catch (error) {
      console.error("DB Error in getUser:", error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const rows = await db.execute(
        sql`SELECT * FROM users WHERE username = ${username}`
      );
      return rows.length > 0 ? rows[0] as User : undefined;
    } catch (error) {
      console.error("DB Error in getUserByUsername:", error);
      throw error;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      // Prepare the user data with proper role and status
      const {
        username, password, fullName, email, role, 
        status = UserStatus.ACTIVE, organizationId,
        region, state, city, pincode, address, managerId
      } = userData;

      const rows = await db.execute(
        sql`INSERT INTO users (
          username, password, full_name, email, role, status, 
          organization_id, region, state, city, pincode, address, manager_id
        ) VALUES (
          ${username}, ${password}, ${fullName}, ${email}, ${role}, ${status},
          ${organizationId}, ${region}, ${state}, ${city}, ${pincode}, ${address}, ${managerId}
        ) RETURNING *`
      );
      
      return rows[0] as User;
    } catch (error) {
      console.error("DB Error in createUser:", error);
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      // Build the SET clause dynamically based on provided fields
      let setClauses = [];
      const values: any[] = [];
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
        return await this.getUser(id); // No updates needed
      }

      // Execute the update query
      const query = `
        UPDATE users 
        SET ${setClauses.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING *
      `;
      values.push(id);
      
      const result = await pool.query(query, values);
      return result.rows.length > 0 ? result.rows[0] as User : undefined;
    } catch (error) {
      console.error("DB Error in updateUser:", error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await db.execute(
        sql`DELETE FROM users WHERE id = ${id} RETURNING id`
      );
      return result.length > 0;
    } catch (error) {
      console.error("DB Error in deleteUser:", error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const rows = await db.execute(sql`SELECT * FROM users`);
      return rows as User[];
    } catch (error) {
      console.error("DB Error in getAllUsers:", error);
      throw error;
    }
  }

  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const rows = await db.execute(
        sql`SELECT * FROM users WHERE role = ${role}`
      );
      return rows as User[];
    } catch (error) {
      console.error("DB Error in getUsersByRole:", error);
      throw error;
    }
  }

  async getUsersByOrganization(organizationId: number): Promise<User[]> {
    try {
      const rows = await db.execute(
        sql`SELECT * FROM users WHERE organization_id = ${organizationId}`
      );
      return rows as User[];
    } catch (error) {
      console.error("DB Error in getUsersByOrganization:", error);
      throw error;
    }
  }

  async getUsersByManager(managerId: number): Promise<User[]> {
    try {
      const rows = await db.execute(
        sql`SELECT * FROM users WHERE manager_id = ${managerId}`
      );
      return rows as User[];
    } catch (error) {
      console.error("DB Error in getUsersByManager:", error);
      throw error;
    }
  }

  // ORGANIZATION METHODS

  async getOrganization(id: number): Promise<Organization | undefined> {
    try {
      const rows = await db.execute(
        sql`SELECT * FROM organizations WHERE id = ${id}`
      );
      return rows.length > 0 ? rows[0] as Organization : undefined;
    } catch (error) {
      console.error("DB Error in getOrganization:", error);
      throw error;
    }
  }

  async createOrganization(orgData: InsertOrganization): Promise<Organization> {
    try {
      const { name, type } = orgData;
      const rows = await db.execute(
        sql`INSERT INTO organizations (name, type) VALUES (${name}, ${type}) RETURNING *`
      );
      return rows[0] as Organization;
    } catch (error) {
      console.error("DB Error in createOrganization:", error);
      throw error;
    }
  }

  async updateOrganization(id: number, orgData: Partial<InsertOrganization>): Promise<Organization | undefined> {
    try {
      let setClauses = [];
      const values: any[] = [];
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
        return await this.getOrganization(id); // No updates needed
      }

      const query = `
        UPDATE organizations 
        SET ${setClauses.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING *
      `;
      values.push(id);
      
      const result = await pool.query(query, values);
      return result.rows.length > 0 ? result.rows[0] as Organization : undefined;
    } catch (error) {
      console.error("DB Error in updateOrganization:", error);
      throw error;
    }
  }

  async deleteOrganization(id: number): Promise<boolean> {
    try {
      const result = await db.execute(
        sql`DELETE FROM organizations WHERE id = ${id} RETURNING id`
      );
      return result.length > 0;
    } catch (error) {
      console.error("DB Error in deleteOrganization:", error);
      throw error;
    }
  }

  async getAllOrganizations(): Promise<Organization[]> {
    try {
      const rows = await db.execute(sql`SELECT * FROM organizations`);
      return rows as Organization[];
    } catch (error) {
      console.error("DB Error in getAllOrganizations:", error);
      throw error;
    }
  }

  // ACTIVITY METHODS

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    try {
      const { userId, action, description } = activityData;
      const rows = await db.execute(
        sql`INSERT INTO activities (user_id, action, description) 
        VALUES (${userId}, ${action}, ${description}) 
        RETURNING *`
      );
      return rows[0] as Activity;
    } catch (error) {
      console.error("DB Error in createActivity:", error);
      throw error;
    }
  }

  async getActivities(limit?: number): Promise<Activity[]> {
    try {
      let query = sql`SELECT * FROM activities ORDER BY timestamp DESC`;
      if (limit) {
        query = sql`${query} LIMIT ${limit}`;
      }
      const rows = await db.execute(query);
      return rows as Activity[];
    } catch (error) {
      console.error("DB Error in getActivities:", error);
      throw error;
    }
  }

  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    try {
      const rows = await db.execute(
        sql`SELECT * FROM activities WHERE user_id = ${userId} ORDER BY timestamp DESC`
      );
      return rows as Activity[];
    } catch (error) {
      console.error("DB Error in getActivitiesByUser:", error);
      throw error;
    }
  }

  // Initialize the database with required data (admin user, etc.)
  async initializeDatabase(): Promise<void> {
    try {
      // Check if we need to initialize (no organizations exist)
      const orgs = await this.getAllOrganizations();
      if (orgs.length > 0) {
        console.log("Database already initialized, skipping...");
        return;
      }

      console.log("Initializing database with default data...");

      // Create system organization
      const systemOrg = await this.createOrganization({
        name: "System Administration",
        type: OrganizationType.SYSTEM
      });

      // Create super admin user
      const adminUser = await this.createUser({
        username: "admin",
        password: hashPassword("admin"),
        fullName: "Admin User",
        email: "admin@example.com",
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        organizationId: systemOrg.id,
        region: null,
        state: null,
        city: null,
        pincode: null,
        address: null,
        managerId: null,
        lastLogin: null
      });

      console.log("Database initialized with admin user and system organization");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }
}