const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie"); // ensure you have a Movie model defined

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
    const { title, description, year, genres, rating } = req.body;

    // Convert genres string into an array
    const genresArray = genres.split(",").map(g => g.trim());

    const newMovie = new Movie({
      title,
      description,
      year,
      genres: genresArray,
      rating
    });

    await newMovie.save();
    res.redirect("/movies");
  } catch (err) {
    console.error("Error adding movie:", err);
    res.render("addmovie", { errors: [{ msg: "Failed to add movie" }] });
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
    const { title, description, year, genres, rating } = req.body;
    const genresArray = genres.split(",").map(g => g.trim());

    await Movie.findByIdAndUpdate(req.params.id, {
      title,
      description,
      year,
      genres: genresArray,
      rating
    });

    res.redirect("/movies");
  } catch (err) {
    console.error("Error updating movie:", err);
    res.redirect("/movies");
  }
});

// Handle delete movie
router.post("/delete/:id", async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }

  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.redirect("/movies");
  } catch (err) {
    console.error("Error deleting movie:", err);
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

