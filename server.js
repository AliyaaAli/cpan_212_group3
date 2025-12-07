const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));

// Serve static assets (CSS, images, JS) from public/
app.use(express.static(path.join(__dirname, "public")));

// Cache control
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

// MongoDB connection (cached for serverless)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
      .then((mongoose) => {
        console.log("MongoDB connected (serverless cached)");
        return mongoose;
      })
      .catch((err) => {
        console.error("MongoDB connection failed:", err);
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
connectDB();

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 7 * 24 * 60 * 60, // 7 days
    }),
   cookie: {
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // only true in production
  sameSite: "lax",
},
  })
);

// Session logging + current user
app.use((req, res, next) => {
  console.log("Path:", req.path, "| SessionID:", req.sessionID, "| UserId:", req.session.userId);
  res.locals.currentUser = req.session.userId || null;
  next();
});

// Mount routes
app.use("/", authRoutes);      // now /login and /register work directly
app.use("/movies", movieRoutes);

// Home route
app.get("/", (req, res) => res.render("home"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
