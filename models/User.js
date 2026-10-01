const mongoose = require("mongoose");

// Define the schema for a User document.
const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: {
    type: Number,
    min: [18, "Minimum age is 18"],
    max: [80, "Maximum age is 80"],
    required: true,
  },
  password: {
    type: String,
    // minlength (not "min") is the correct validator for string length.
    minlength: [8, "Minimum 8 characters"],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
