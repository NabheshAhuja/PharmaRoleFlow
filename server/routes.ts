import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { UserRole, insertUserSchema, insertOrganizationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication and authorization
  const { isAuthenticated, hasRole } = setupAuth(app);

  // Users API
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password hashes from response
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", isAuthenticated, async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user with this username or email already exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = (await storage.getAllUsers()).find(u => u.email === validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create user
      const newUser = await storage.createUser({
        ...validatedData,
        password: validatedData.password // This will be hashed before saving in the auth middleware
      });
      
      // Log activity
      await storage.createActivity({
        userId: (req.user as any).id,
        action: "CREATE_USER",
        description: `User ${(req.user as any).username} created a new user ${newUser.username} with role ${newUser.role}`
      });
      
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user
      const updatedUser = await storage.updateUser(userId, req.body);
      
      // Log activity
      await storage.createActivity({
        userId: (req.user as any).id,
        action: "UPDATE_USER",
        description: `User ${(req.user as any).username} updated user ${user.username}`
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Can't delete yourself
      if (user.id === (req.user as any).id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete user" });
      }
      
      // Log activity
      await storage.createActivity({
        userId: (req.user as any).id,
        action: "DELETE_USER",
        description: `User ${(req.user as any).username} deleted user ${user.username}`
      });
      
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Organizations API
  app.get("/api/organizations", isAuthenticated, async (req, res) => {
    try {
      const organizations = await storage.getAllOrganizations();
      res.json(organizations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  });

  app.get("/api/organizations/:id", isAuthenticated, async (req, res) => {
    try {
      const orgId = parseInt(req.params.id);
      const org = await storage.getOrganization(orgId);
      
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }
      
      res.json(org);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organization" });
    }
  });

  app.post("/api/organizations", isAuthenticated, async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertOrganizationSchema.parse(req.body);
      
      // Create organization
      const newOrg = await storage.createOrganization(validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: (req.user as any).id,
        action: "CREATE_ORGANIZATION",
        description: `User ${(req.user as any).username} created a new organization ${newOrg.name}`
      });
      
      res.status(201).json(newOrg);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid organization data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create organization" });
    }
  });

  // Activities API
  app.get("/api/activities", isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivities(limit);
      
      // Enhance activities with user data
      const enhancedActivities = await Promise.all(activities.map(async (activity) => {
        const user = await storage.getUser(activity.userId);
        return {
          ...activity,
          user: user ? { id: user.id, username: user.username, fullName: user.fullName } : undefined
        };
      }));
      
      res.json(enhancedActivities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Dashboard stats
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const organizations = await storage.getAllOrganizations();
      
      // Count users by role and status
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.status === "ACTIVE").length;
      const inactiveUsers = users.filter(u => u.status === "INACTIVE").length;
      const pendingUsers = users.filter(u => u.status === "PENDING").length;
      
      // Count pharma companies and distributors
      const pharmaCompanies = organizations.filter(o => o.type === "PHARMA_COMPANY").length;
      const distributors = organizations.filter(o => o.type === "DISTRIBUTOR").length;
      
      // Count medical representatives
      const activeMRs = users.filter(u => 
        u.role === UserRole.MEDICAL_REPRESENTATIVE && u.status === "ACTIVE"
      ).length;
      
      res.json({
        totalUsers,
        activeUsers,
        inactiveUsers,
        pendingUsers,
        pharmaCompanies,
        distributors,
        activeMRs
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
