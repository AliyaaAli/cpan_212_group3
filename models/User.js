const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String, required: true } // stored as hashed
});

module.exports = mongoose.model("User", userSchema);
