import { activities, users, organizations, type User, type InsertUser, type Organization, type InsertOrganization, type Activity, type InsertActivity } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private organizations: Map<number, Organization>;
  private activities: Map<number, Activity>;
  sessionStore: session.SessionStore;
  currentUserId: number;
  currentOrgId: number;
  currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.organizations = new Map();
    this.activities = new Map();
    this.currentUserId = 1;
    this.currentOrgId = 1;
    this.currentActivityId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
    
    // Initialize with some default data
    this.initializeData();
  }

  private initializeData() {
    // Add a system organization
    const systemOrg: Organization = {
      id: this.currentOrgId++,
      name: "System Administration",
      type: "SYSTEM"
    };
    this.organizations.set(systemOrg.id, systemOrg);

    // Add a super admin user
    const superAdmin: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "admin", // This will be hashed in auth.ts before saving
      fullName: "Admin User",
      email: "admin@pharmadist.com",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      organizationId: systemOrg.id,
      region: null,
      managerId: null,
      lastLogin: null
    };
    this.users.set(superAdmin.id, superAdmin);
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async getUsersByOrganization(organizationId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.organizationId === organizationId);
  }

  async getUsersByManager(managerId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.managerId === managerId);
  }

  // Organization Methods
  async getOrganization(id: number): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const id = this.currentOrgId++;
    const newOrg: Organization = { ...organization, id };
    this.organizations.set(id, newOrg);
    return newOrg;
  }

  async updateOrganization(id: number, organization: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const existingOrg = this.organizations.get(id);
    if (!existingOrg) return undefined;
    
    const updatedOrg = { ...existingOrg, ...organization };
    this.organizations.set(id, updatedOrg);
    return updatedOrg;
  }

  async deleteOrganization(id: number): Promise<boolean> {
    return this.organizations.delete(id);
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return Array.from(this.organizations.values());
  }

  // Activity Methods
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const timestamp = new Date();
    const newActivity: Activity = { ...activity, id, timestamp };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async getActivities(limit?: number): Promise<Activity[]> {
    const allActivities = Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? allActivities.slice(0, limit) : allActivities;
  }

  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const storage = new MemStorage();
