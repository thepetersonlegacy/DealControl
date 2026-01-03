import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { registerSchema, loginSchema } from "@shared/schema";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminEmail || !adminPassword) {
    console.log("No admin credentials configured (ADMIN_EMAIL, ADMIN_PASSWORD)");
    return;
  }

  try {
    const existingUser = await storage.getUserByEmail(adminEmail);
    if (existingUser) {
      console.log("Admin user already exists");
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await storage.createUser({
      email: adminEmail,
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      isAdmin: 1,
    });
    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}

export async function setupLocalAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !user.passwordHash) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, { 
            id: user.id, 
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin,
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, cb) => cb(null, user.id));
  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return cb(null, false);
      }
      cb(null, { 
        id: user.id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
      });
    } catch (error) {
      cb(error);
    }
  });

  await seedAdminUser();

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(validatedData.password, 12);
      const user = await storage.createUser({
        email: validatedData.email,
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        isAdmin: 0,
      });

      req.login({ 
        id: user.id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
      }, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed after registration" });
        }
        res.json({ 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName,
          isAdmin: user.isAdmin,
        });
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (error: any) {
      return res.status(400).json({ error: error.errors?.[0]?.message || "Invalid input" });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed" });
        }
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user);
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export const isAdmin: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = req.user as any;
  if (!user?.isAdmin) {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  next();
};
