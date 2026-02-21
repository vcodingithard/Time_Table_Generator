import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";

// --- Route Imports ---
import authRoutes from "./routes/authRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import metadataRoutes from "./routes/metadataRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";

// --- Model Import for Passport ---
import Institute from "./models/Institute.js";

dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === "production";

// --------------------------------
// DATABASE CONNECTION
// --------------------------------
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// --------------------------------
// MIDDLEWARES
// --------------------------------
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://mini-project-lilac-ten.vercel.app",
      ];
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// --------------------------------
// SESSION CONFIG
// --------------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB,
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 14,
      sameSite: "lax",
      secure: false,
    },
  })
);

// --------------------------------
// PASSPORT CONFIG
// --------------------------------
app.use(passport.initialize());
app.use(passport.session());

// passport-local-mongoose simplifies this significantly
passport.use(Institute.createStrategy()); 
passport.serializeUser(Institute.serializeUser());
passport.deserializeUser(Institute.deserializeUser());

// --------------------------------
// ROUTES
// --------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/metadata", metadataRoutes);
app.use("/api/timetable", timetableRoutes);
// Health Check
app.get("/", (req, res) => res.json({ status: "online", version: "1.0.0" }));

// --------------------------------
// ERROR HANDLING
// --------------------------------
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));