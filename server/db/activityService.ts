import { 
  type Activity, type InsertActivity 
} from "@shared/schema";
import { dbConnection } from "./connection";
import { mapActivityFromDb } from "./utils";

/**
 * Activity tracking service
 * Handles all activity-related database operations
 */
export class ActivityService {
  private pool = dbConnection.getPool();

  /**
   * Create a new activity log entry
   */
  async createActivity(activityData: InsertActivity): Promise<Activity> {
    try {
      const { userId, action, description } = activityData;
      
      const result = await this.pool.query(
        'INSERT INTO activities (user_id, action, description) VALUES ($1, $2, $3) RETURNING *',
        [userId, action, description]
      );
      
      return mapActivityFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error in createActivity:', error);
      throw error;
    }
  }

  /**
   * Get activity logs with optional limit
   */
  async getActivities(limit?: number): Promise<Activity[]> {
    try {
      let query = 'SELECT * FROM activities ORDER BY timestamp DESC';
      const params = [];
      
      if (limit) {
        query += ' LIMIT $1';
        params.push(limit);
      }
      
      const result = await this.pool.query(query, params);
      return result.rows.map((row: any) => mapActivityFromDb(row));
    } catch (error) {
      console.error('Error in getActivities:', error);
      throw error;
    }
  }

  /**
   * Get activity logs for a specific user
   */
  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM activities WHERE user_id = $1 ORDER BY timestamp DESC',
        [userId]
      );
      
      return result.rows.map((row: any) => mapActivityFromDb(row));
    } catch (error) {
      console.error('Error in getActivitiesByUser:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const activityService = new ActivityService();