import { 
  type User, type InsertUser, type Organization, type InsertOrganization, 
  type Activity, type InsertActivity 
} from "@shared/schema";
import session from "express-session";

// Import the database storage implementation
import { DatabaseStorage } from './db/index';

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  getUsersByOrganization(organizationId: number): Promise<User[]>;
  getUsersByManager(managerId: number): Promise<User[]>;
  
  // Organization management
  getOrganization(id: number): Promise<Organization | undefined>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  updateOrganization(id: number, organization: Partial<InsertOrganization>): Promise<Organization | undefined>;
  deleteOrganization(id: number): Promise<boolean>;
  getAllOrganizations(): Promise<Organization[]>;
  
  // Activity tracking
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivities(limit?: number): Promise<Activity[]>;
  getActivitiesByUser(userId: number): Promise<Activity[]>;

  // Session store
  sessionStore: session.Store;
}

// Use database storage for production use
export const storage = new DatabaseStorage();