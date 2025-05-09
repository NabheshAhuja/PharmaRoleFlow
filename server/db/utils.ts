import { createHash } from "crypto";
import { 
  type User, type Organization, type Activity,
  type UserRoleType, type UserStatusType, type OrganizationTypeType 
} from "@shared/schema";

/**
 * Hash a password using SHA-256
 * Note: In a production environment, use a more secure hashing algorithm like bcrypt
 */
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

/**
 * Convert database user row to User type
 * Maps snake_case database column names to camelCase TypeScript properties
 */
export function mapUserFromDb(dbUser: any): User {
  return {
    id: dbUser.id,
    username: dbUser.username,
    password: dbUser.password,
    fullName: dbUser.full_name,
    email: dbUser.email,
    role: dbUser.role as UserRoleType,
    status: dbUser.status as UserStatusType,
    organizationId: dbUser.organization_id || null,
    region: dbUser.region || null,
    state: dbUser.state || null,
    city: dbUser.city || null,
    pincode: dbUser.pincode || null,
    address: dbUser.address || null,
    managerId: dbUser.manager_id || null,
    lastLogin: dbUser.last_login || null
  };
}

/**
 * Convert database organization row to Organization type
 */
export function mapOrganizationFromDb(dbOrg: any): Organization {
  return {
    id: dbOrg.id,
    name: dbOrg.name,
    type: dbOrg.type as OrganizationTypeType
  };
}

/**
 * Convert database activity row to Activity type
 */
export function mapActivityFromDb(dbActivity: any): Activity {
  return {
    id: dbActivity.id,
    userId: dbActivity.user_id || null,
    action: dbActivity.action,
    description: dbActivity.description,
    timestamp: dbActivity.timestamp
  };
}