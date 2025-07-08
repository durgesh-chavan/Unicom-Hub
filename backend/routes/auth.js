import express from "express";
import bcrypt from "bcryptjs"; // Import bcrypt
import { User } from "../db.js";

const router = express.Router();

// Sign Up Route
router.post("/signup", async (req, res) => {
  const { email, password } = req.body; // Expect `password` from frontend

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = new User({ email, password_hash: hashedPassword }); // Save hashed password
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sign In Route
router.post("/signin", async (req, res) => {
  const { email, password } = req.body; // Expect `password` from frontend

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({ message: "Sign In Successful", userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
