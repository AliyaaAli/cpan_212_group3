const express = require("express");
const router = express.Router();
const User = require("../models/User"); // adjust path to your User model

// Show login form
router.get("/login", (req, res) => {
  res.render("auth/login"); // make sure you have views/auth/login.ejs
});

// Handle login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).render("auth/login", { error: "Invalid credentials" });
    }

    // Save user ID in session
    req.session.userId = user._id;
    console.log("Login success, user._id:", user._id);

    // Redirect to a protected page
    return res.redirect("/movies");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Internal server error");
  }
});

// Handle logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Could not log out");
    }
    res.clearCookie("connect.sid");
    res.redirect("/auth/login");
  });
});

// Show register form
router.get("/register", (req, res) => {
  res.render("auth/register"); // make sure you have views/auth/register.ejs
});

// Handle register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).render("auth/register", { error: "Username already exists" });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    req.session.userId = newUser._id;
    console.log("Registration success, user._id:", newUser._id);

    res.redirect("/movies");
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
