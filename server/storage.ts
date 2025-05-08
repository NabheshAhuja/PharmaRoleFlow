import { UserRole, UserStatus, OrganizationType, users, organizations, activities, type User, type InsertUser, type Organization, type InsertOrganization, type Activity, type InsertActivity } from "@shared/schema";
import session from "express-session";
import { createHash } from "crypto";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

// Helper to hash passwords
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private organizations: Map<number, Organization>;
  private activities: Map<number, Activity>;
  sessionStore: session.Store;
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
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.initializeData();
  }

  private initializeData() {
    // Create system organization
    const systemOrg: Organization = {
      id: this.currentOrgId++,
      name: "System Administration",
      type: OrganizationType.SYSTEM
    };
    this.organizations.set(systemOrg.id, systemOrg);
    
    // Create super admin user
    const superAdmin: User = {
      id: this.currentUserId++,
      username: "admin",
      password: hashPassword("admin"), // In a real app, we'd use bcrypt or similar
      fullName: "Admin User",
      email: "admin@example.com",
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      organizationId: systemOrg.id,
      region: null,
      state: null,
      city: null,
      pincode: null,
      address: null,
      managerId: null,
      lastLogin: null
    };
    this.users.set(superAdmin.id, superAdmin);
  }

  async getUser(id: number): Promise<User | undefined> {
    return Promise.resolve(this.users.get(id));
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Promise.resolve(
      Array.from(this.users.values()).find(user => user.username === username)
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return Promise.resolve(user);
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return Promise.resolve(undefined);
    
    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return Promise.resolve(updatedUser);
  }

  async deleteUser(id: number): Promise<boolean> {
    return Promise.resolve(this.users.delete(id));
  }

  async getAllUsers(): Promise<User[]> {
    return Promise.resolve(Array.from(this.users.values()));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Promise.resolve(
      Array.from(this.users.values()).filter(user => user.role === role)
    );
  }

  async getUsersByOrganization(organizationId: number): Promise<User[]> {
    return Promise.resolve(
      Array.from(this.users.values()).filter(
        user => user.organizationId === organizationId
      )
    );
  }

  async getUsersByManager(managerId: number): Promise<User[]> {
    return Promise.resolve(
      Array.from(this.users.values()).filter(
        user => user.managerId === managerId
      )
    );
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    return Promise.resolve(this.organizations.get(id));
  }

  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const id = this.currentOrgId++;
    const newOrg: Organization = { ...organization, id };
    this.organizations.set(id, newOrg);
    return Promise.resolve(newOrg);
  }

  async updateOrganization(id: number, organization: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const existingOrg = this.organizations.get(id);
    if (!existingOrg) return Promise.resolve(undefined);
    
    const updatedOrg = { ...existingOrg, ...organization };
    this.organizations.set(id, updatedOrg);
    return Promise.resolve(updatedOrg);
  }

  async deleteOrganization(id: number): Promise<boolean> {
    return Promise.resolve(this.organizations.delete(id));
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return Promise.resolve(Array.from(this.organizations.values()));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const timestamp = new Date();
    const newActivity: Activity = { ...activity, id, timestamp };
    this.activities.set(id, newActivity);
    return Promise.resolve(newActivity);
  }

  async getActivities(limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (limit) {
      return Promise.resolve(activities.slice(0, limit));
    }
    
    return Promise.resolve(activities);
  }

  async getActivitiesByUser(userId: number): Promise<Activity[]> {
    return Promise.resolve(
      Array.from(this.activities.values())
        .filter(activity => activity.userId === userId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    );
  }
}

export const storage = new MemStorage();