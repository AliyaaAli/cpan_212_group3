const express = require("express");
const router = express.Router();

// Movies list page
router.get("/", (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }

  // Render your movie list view
  res.render("movielist"); // views/movielist.ejs
});

// Add movie page
router.get("/add", (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }

  res.render("addmovie"); // views/addmovie.ejs
});

// Edit movie page
router.get("/edit/:id", (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }

  res.render("editmovie", { movieId: req.params.id }); // views/editmovie.ejs
});

// Movie details page
router.get("/:id", (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }

  res.render("moviedetails", { movieId: req.params.id }); // views/moviedetails.ejs
});

module.exports = router;
