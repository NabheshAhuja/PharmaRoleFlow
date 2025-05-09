import { 
  UserStatus,
  type User, type InsertUser 
} from "@shared/schema";
import { dbConnection } from "./connection";
import { mapUserFromDb } from "./utils";

/**
 * User management service
 * Handles all user-related database operations
 */
export class UserService {
  private pool = dbConnection.getPool();

  /**
   * Get a user by ID
   */
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return mapUserFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  }

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return mapUserFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
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
      
      return mapUserFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  /**
   * Update an existing user
   */
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
      
      return mapUserFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  /**
   * Delete a user
   */
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

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const result = await this.pool.query('SELECT * FROM users');
      return result.rows.map((row: any) => mapUserFromDb(row));
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<User[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM users WHERE role = $1',
        [role]
      );
      
      return result.rows.map((row: any) => mapUserFromDb(row));
    } catch (error) {
      console.error('Error in getUsersByRole:', error);
      throw error;
    }
  }

  /**
   * Get users by organization
   */
  async getUsersByOrganization(organizationId: number): Promise<User[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM users WHERE organization_id = $1',
        [organizationId]
      );
      
      return result.rows.map((row: any) => mapUserFromDb(row));
    } catch (error) {
      console.error('Error in getUsersByOrganization:', error);
      throw error;
    }
  }

  /**
   * Get users by manager
   */
  async getUsersByManager(managerId: number): Promise<User[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM users WHERE manager_id = $1',
        [managerId]
      );
      
      return result.rows.map((row: any) => mapUserFromDb(row));
    } catch (error) {
      console.error('Error in getUsersByManager:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const userService = new UserService();