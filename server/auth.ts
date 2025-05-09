import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { createHash } from "crypto";
import { storage } from "./storage";
import { User as SelectUser, UserRole, UserStatus } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Simple password hashing function matching storage.ts implementation
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "pharma-dist-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false);
        }
        
        // Check password - hash the provided password and compare with stored hash
        const hashedPassword = hashPassword(password);
        if (hashedPassword !== user.password) {
          return done(null, false);
        }
        
        // Password matches - update last login time and return user
        await storage.updateUser(user.id, { lastLogin: new Date() });
        return done(null, user);
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Check if user has specific role
  const hasRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      next();
    };
  };

  // Auth routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check email uniqueness
      const existingEmail = Array.from((await storage.getAllUsers())).find(
        u => u.email === req.body.email
      );
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: hashPassword(req.body.password),
        status: UserStatus.ACTIVE
      });

      // Log activity
      await storage.createActivity({
        userId: user.id,
        action: "REGISTER",
        description: `User ${user.username} registered`
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Don't return the password hash
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      
      req.login(user, async (loginErr) => {
        if (loginErr) return next(loginErr);
        
        // Log activity
        await storage.createActivity({
          userId: user.id,
          action: "LOGIN",
          description: `User ${user.username} logged in`
        });
        
        // Don't return the password hash
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", isAuthenticated, async (req, res, next) => {
    const userId = req.user!.id;
    const username = req.user!.username;
    
    req.logout((err) => {
      if (err) return next(err);
      
      // Log activity
      storage.createActivity({
        userId,
        action: "LOGOUT",
        description: `User ${username} logged out`
      });
      
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Don't return the password hash
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });

  return { isAuthenticated, hasRole };
}