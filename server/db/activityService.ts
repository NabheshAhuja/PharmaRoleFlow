import { 
  type Activity, type InsertActivity,
  activities
} from "@shared/schema";
import { db } from "../db";
import { desc, eq, SQL } from "drizzle-orm";

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
      // Use Drizzle ORM to select activities with ordering
      const query = db.select().from(activities).orderBy(desc(activities.timestamp));
      
      // Execute the query with or without limit
      if (limit) {
        return await query.limit(limit);
      } else {
        return await query;
      }
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
      return await db.select()
        .from(activities)
        .where(eq(activities.userId, userId))
        .orderBy(desc(activities.timestamp));
    } catch (error) {
      console.error('Error in getActivitiesByUser:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const activityService = new ActivityService();