require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Trust proxy (needed for secure cookies on Render)
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Make currentUser available in all EJS views
app.use((req, res, next) => {
  res.locals.currentUser = req.session ? req.session.userId : null;
  next();
});

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");

app.use("/auth", authRoutes);
app.use("/movies", movieRoutes);

// Homepage route
app.get("/", (req, res) => {
  res.render("home"); // views/home.ejs
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

