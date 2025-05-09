import { 
  type Organization, type InsertOrganization,
  organizations 
} from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

/**
 * Organization management service
 * Handles all organization-related database operations using Drizzle ORM
 */
export class OrganizationService {
  /**
   * Get an organization by ID
   */
  async getOrganization(id: number): Promise<Organization | undefined> {
    try {
      const result = await db.select().from(organizations).where(eq(organizations.id, id));
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error in getOrganization:', error);
      throw error;
    }
  }

  /**
   * Create a new organization
   */
  async createOrganization(orgData: InsertOrganization): Promise<Organization> {
    try {
      const [newOrg] = await db.insert(organizations).values(orgData).returning();
      return newOrg;
    } catch (error) {
      console.error('Error in createOrganization:', error);
      throw error;
    }
  }

  /**
   * Update an existing organization
   */
  async updateOrganization(id: number, orgData: Partial<InsertOrganization>): Promise<Organization | undefined> {
    try {
      if (Object.keys(orgData).length === 0) {
        return this.getOrganization(id);
      }
      
      const [updatedOrg] = await db.update(organizations)
        .set(orgData)
        .where(eq(organizations.id, id))
        .returning();
      
      return updatedOrg || undefined;
    } catch (error) {
      console.error('Error in updateOrganization:', error);
      throw error;
    }
  }

  /**
   * Delete an organization
   */
  async deleteOrganization(id: number): Promise<boolean> {
    try {
      const result = await db.delete(organizations)
        .where(eq(organizations.id, id))
        .returning({ id: organizations.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('Error in deleteOrganization:', error);
      throw error;
    }
  }

  /**
   * Get all organizations
   */
  async getAllOrganizations(): Promise<Organization[]> {
    try {
      return await db.select().from(organizations);
    } catch (error) {
      console.error('Error in getAllOrganizations:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const organizationService = new OrganizationService();