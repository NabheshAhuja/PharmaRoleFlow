import { 
  type Activity, type InsertActivity,
  activities
} from "@shared/schema";
import { db } from "../db";
import { desc, eq, sql } from "drizzle-orm";

// Helper function to map database rows to Activity objects
function mapRowToActivity(row: any): Activity {
  // Safely parse the timestamp
  let timestamp: Date;
  try {
    timestamp = new Date(String(row.timestamp));
  } catch (error) {
    console.warn('Failed to parse timestamp, using current date', error);
    timestamp = new Date();
  }

  return {
    id: Number(row.id),
    userId: row.user_id ? Number(row.user_id) : null,
    action: String(row.action),
    description: String(row.description),
    timestamp
  };
}

/**
 * Activity tracking service
 * Handles all activity-related database operations using Drizzle ORM
 */
export class ActivityService {
  /**
   * Create a new activity log entry
   */
  async createActivity(activityData: InsertActivity): Promise<Activity> {
    try {
      const { userId, action, description } = activityData;
      
      // Use Drizzle ORM to insert the activity
      const [newActivity] = await db.insert(activities).values([{
        userId,
        action,
        description
      }]).returning();
      
      return newActivity;
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
      // Use SQL directly for more flexibility
      const query = limit 
        ? sql`SELECT * FROM activities ORDER BY timestamp DESC LIMIT ${limit}` 
        : sql`SELECT * FROM activities ORDER BY timestamp DESC`;
        
      const result = await db.execute(query);
      
      return result.rows.map(row => mapRowToActivity(row));
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
      const result = await db.execute(sql`
        SELECT * FROM activities 
        WHERE user_id = ${userId}
        ORDER BY timestamp DESC
      `);
      
      return result.rows.map(row => mapRowToActivity(row));
    } catch (error) {
      console.error('Error in getActivitiesByUser:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const activityService = new ActivityService();