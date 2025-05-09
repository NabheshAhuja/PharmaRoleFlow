import { 
  UserRole, UserStatus, OrganizationType, organizations
} from "@shared/schema";
import { db } from "../db";
import { count } from "drizzle-orm";
import { hashPassword } from "./utils";
import { organizationService } from "./organizationService";
import { userService } from "./userService";

/**
 * Database initialization service
 * Handles creating initial data in the database
 */
export class InitializationService {
  /**
   * Initialize the database with required data
   * - Creates system organization if not exists
   * - Creates admin user if not exists
   */
  async initializeDatabase(): Promise<void> {
    try {
      // Check if we need to initialize (no organizations exist)
      const result = await db.select({ count: countAll() }).from(organizations);
      if (result[0].count > 0) {
        console.log('Database already initialized, skipping...');
        return;
      }

      console.log('Initializing database with default data...');

      // Create System organization
      const systemOrg = await organizationService.createOrganization({
        name: 'System Administration',
        type: OrganizationType.SYSTEM
      });

      // Create admin user
      await userService.createUser({
        username: 'admin',
        password: 'admin', // Will be hashed in the service
        fullName: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        organizationId: systemOrg.id,
        region: null,
        state: null,
        city: null,
        pincode: null,
        address: null,
        managerId: null
      });

      console.log('Database initialized with admin user and system organization');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const initializationService = new InitializationService();