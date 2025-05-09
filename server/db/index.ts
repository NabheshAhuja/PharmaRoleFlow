import { 
  type User, type InsertUser, 
  type Organization, type InsertOrganization,
  type Activity, type InsertActivity 
} from "@shared/schema";
import { IStorage } from "../storage";
import { dbConnection } from "./connection";
import { userService } from "./userService";
import { organizationService } from "./organizationService";
import { activityService } from "./activityService";
import { initializationService } from "./initialization";

/**
 * Database storage implementation
 * Consolidates all database services to implement the IStorage interface
 */
class DatabaseStorageImpl implements IStorage {
  // Use session store from the database connection
  sessionStore = dbConnection.sessionStore;

  constructor() {
    // Initialize the database on startup
    this.initializeDatabase().catch(error => {
      console.error("Failed to initialize database:", error);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return userService.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return userService.getUserByUsername(username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    return userService.createUser(userData);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    return userService.updateUser(id, userData);
  }

  async deleteUser(id: number): Promise<boolean> {
    return userService.deleteUser(id);
  }

  async getAllUsers(): Promise<User[]> {
    return userService.getAllUsers();
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return userService.getUsersByRole(role);
  }

  async getUsersByOrganization(organizationId: number): Promise<User[]> {
    return userService.getUsersByOrganization(organizationId);
  }

  async getUsersByManager(managerId: number): Promise<User[]> {
    return userService.getUsersByManager(managerId);
  }

  // Organization methods
  async getOrganization(id: number): Promise<Organization | undefined> {
    return organizationService.getOrganization(id);
  }

  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    return organizationService.createOrganization(organization);
  }

  async updateOrganization(id: number, organization: Partial<InsertOrganization>): Promise<Organization | undefined> {
    return organizationService.updateOrganization(id, organization);
  }

  async deleteOrganization(id: number): Promise<boolean> {
    return organizationService.deleteOrganization(id);
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return organizationService.getAllOrganizations();
  }

  // Activity methods
  async createActivity(activity: InsertActivity): Promise<Activity> {
    return activityService.createActivity(activity);
  }

  async getActivities(limit?: number): Promise<Activity[]> {
    return activityService.getActivities(limit);
  }

  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    return activityService.getActivitiesByUser(userId);
  }

  // Database initialization
  async initializeDatabase(): Promise<void> {
    return initializationService.initializeDatabase();
  }
}

// Export the implementation as DatabaseStorage for use in storage.ts
export { DatabaseStorageImpl as DatabaseStorage };