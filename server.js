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

// Tell Express it's behind a proxy (needed for secure cookies on Render)
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 7 * 24 * 60 * 60,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
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
app.use("/auth", authRoutes);

// Protected route example
app.get("/movies", (req, res) => {
  console.log("Session check:", req.session);
  console.log("User ID:", req.session ? req.session.userId : null);

  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }

  res.render("movies"); // views/movies.ejs
});

// Homepage route
app.get("/", (req, res) => {
  res.render("home"); // views/home.ejs
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

