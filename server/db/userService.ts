import { 
  UserStatus, UserRole,
  type User, type InsertUser, type UserRoleType, type UserStatusType,
  users
} from "@shared/schema";
import { db } from "../db";
import { eq, SQL } from "drizzle-orm";
import { hashPassword } from "./utils";

/**
 * User management service
 * Handles all user-related database operations using Drizzle ORM
 */
export class UserService {
  /**
   * Get a user by ID
   */
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result.length > 0 ? result[0] : undefined;
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
      const result = await db.select().from(users).where(eq(users.username, username));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      throw error;
    }
  }

  /**
   * Create a new user with password hashing
   */
  async createUser(userData: InsertUser): Promise<User> {
    try {
      const {
        username, password, fullName, email, role,
        status = UserStatus.ACTIVE, organizationId,
        region, state, city, pincode, address, managerId
      } = userData;

      // Hash the password before storing
      const hashedPassword = hashPassword(password);

      // Use Drizzle ORM to insert the user
      const [newUser] = await db.insert(users).values([{
        username,
        password: hashedPassword,
        fullName,
        email,
        role: role as UserRoleType,
        status: status as UserStatusType,
        organizationId,
        region,
        state,
        city,
        pincode,
        address,
        managerId
      }]).returning();

      return newUser;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  /**
   * Update an existing user with password hashing
   */
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const updateData = { ...userData };
      
      // Hash password if provided
      if (updateData.password) {
        updateData.password = hashPassword(updateData.password);
      }
      
      if (Object.keys(updateData).length === 0) {
        // No fields to update, return existing user
        return this.getUser(id);
      }
      
      // Use Drizzle ORM to update the user
      const [updatedUser] = await db.update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();
      
      return updatedUser || undefined;
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
      const result = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
      return result.length > 0;
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
      return await db.select().from(users);
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
      return await db.select().from(users).where(eq(users.role, role));
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
      return await db.select().from(users).where(eq(users.organizationId, organizationId));
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
      return await db.select().from(users).where(eq(users.managerId, managerId));
    } catch (error) {
      console.error('Error in getUsersByManager:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const userService = new UserService();