import { 
  type Organization, type InsertOrganization 
} from "@shared/schema";
import { dbConnection } from "./connection";
import { mapOrganizationFromDb } from "./utils";

/**
 * Organization management service
 * Handles all organization-related database operations
 */
export class OrganizationService {
  private pool = dbConnection.getPool();

  /**
   * Get an organization by ID
   */
  async getOrganization(id: number): Promise<Organization | undefined> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM organizations WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return mapOrganizationFromDb(result.rows[0]);
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
      const { name, type } = orgData;
      
      const result = await this.pool.query(
        'INSERT INTO organizations (name, type) VALUES ($1, $2) RETURNING *',
        [name, type]
      );
      
      return mapOrganizationFromDb(result.rows[0]);
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
      
      return mapOrganizationFromDb(result.rows[0]);
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

  /**
   * Get all organizations
   */
  async getAllOrganizations(): Promise<Organization[]> {
    try {
      const result = await this.pool.query('SELECT * FROM organizations');
      return result.rows.map((row: any) => mapOrganizationFromDb(row));
    } catch (error) {
      console.error('Error in getAllOrganizations:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const organizationService = new OrganizationService();