const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie"); // make sure you have a Movie model defined

// Movies list page
router.get("/", async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }

  try {
    const movies = await Movie.find(); // fetch all movies from MongoDB
    res.render("movielist", { movies });
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.render("movielist", { movies: [] });
  }
});

// Add movie page (form)
router.get("/add", (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }

  res.render("addmovie");
});

// Handle add movie form submission
router.post("/add", async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }

  try {
    const { title, director, year } = req.body;
    const newMovie = new Movie({ title, director, year });
    await newMovie.save();
    res.redirect("/movies");
  } catch (err) {
    console.error("Error adding movie:", err);
    res.redirect("/movies");
  }
});

// Edit movie page (form)
router.get("/edit/:id", async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }

  try {
    const movie = await Movie.findById(req.params.id);
    res.render("editmovie", { movie });
  } catch (err) {
    console.error("Error loading movie:", err);
    res.redirect("/movies");
  }
});

// Handle edit movie form submission
router.post("/edit/:id", async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }

  try {
    const { title, director, year } = req.body;
    await Movie.findByIdAndUpdate(req.params.id, { title, director, year });
    res.redirect("/movies");
  } catch (err) {
    console.error("Error updating movie:", err);
    res.redirect("/movies");
  }
});

// Movie details page
router.get("/:id", async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }

  try {
    const movie = await Movie.findById(req.params.id);
    res.render("moviedetails", { movie });
  } catch (err) {
    console.error("Error fetching movie details:", err);
    res.redirect("/movies");
  }
});

module.exports = router;
