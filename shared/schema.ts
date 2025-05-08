import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user roles
export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  BUSINESS_UNIT_HEAD: "BUSINESS_UNIT_HEAD",
  REGIONAL_SALES_MANAGER: "REGIONAL_SALES_MANAGER",
  AREA_SALES_MANAGER: "AREA_SALES_MANAGER",
  MEDICAL_REPRESENTATIVE: "MEDICAL_REPRESENTATIVE",
  DISTRIBUTOR_HEAD: "DISTRIBUTOR_HEAD",
  DISTRIBUTOR_EXECUTIVE: "DISTRIBUTOR_EXECUTIVE",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Define organization types
export const OrganizationType = {
  PHARMA_COMPANY: "PHARMA_COMPANY",
  DISTRIBUTOR: "DISTRIBUTOR",
  SYSTEM: "SYSTEM"
} as const;

export type OrganizationTypeType = typeof OrganizationType[keyof typeof OrganizationType];

// Define user status
export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING"
} as const;

export type UserStatusType = typeof UserStatus[keyof typeof UserStatus];

// Organizations table
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().$type<OrganizationTypeType>(),
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().$type<UserRoleType>(),
  status: text("status").notNull().$type<UserStatusType>().default("ACTIVE"),
  organizationId: integer("organization_id").references(() => organizations.id),
  region: text("region"),
  state: text("state"),
  city: text("city"),
  pincode: text("pincode"),
  address: text("address"),
  managerId: integer("manager_id"),
  lastLogin: timestamp("last_login"),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, timestamp: true });

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
