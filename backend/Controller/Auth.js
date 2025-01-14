const express = require("express");
const User = require("../model/User");

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password)
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user without hashing the password
    const newUser = new User({ email, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password)
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if the provided password matches the stored password
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Send a success response without generating a token
    res.status(200).json({ message: "Login successful", userId: user._id });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Failed to log in user" });
  }
});

module.exports = router;
