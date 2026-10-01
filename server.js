require("dotenv").config({ path: "./config/.env" });
const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8004;

// Connect to MongoDB Atlas using the URI stored in config/.env
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Connection error:", err));

// GET /users — return every user in the database.
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /users — create a new user from the request body.
app.post("/users", async (req, res) => {
  try {
    // Fixed: "req, body" (comma) was a typo for "req.body".
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /users/:id — edit a user by ID.
// { new: true } returns the updated document instead of the old one.
app.put("/users/:id", async (req, res) => {
  try {
    const updateUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ updateUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /users/:id — remove a user by ID.
app.delete("/users/:id", async (req, res) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.params.id);
    // Fixed: was checking "deletedUser" (undefined) instead of "deleteUser".
    if (!deleteUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully", deleteUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
