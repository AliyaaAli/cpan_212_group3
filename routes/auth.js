// Show login form
router.get("/login", (req, res) => {
  res.render("login"); // views/login.ejs
});

// Handle login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).render("login", { error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).render("login", { error: "Invalid credentials" });
    }

    // ✅ Save user ID in session
    req.session.userId = user._id;
    console.log("Login success, user._id:", user._id);

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
    res.redirect("/auth/login"); // redirect back to login page
  });
});

// Show register form
router.get("/register", (req, res) => {
  res.render("register"); // views/register.ejs
});

// Handle register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).render("register", { error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    req.session.userId = newUser._id;
    console.log("Registration success, user._id:", newUser._id);

    res.redirect("/movies");
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).send("Internal server error");
  }
});

