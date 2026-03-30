import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "whispr_secret_2024";

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, anonymousName } = req.body;
    if (!email || !password || !anonymousName)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed, anonymousName });
    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, anonymousName: user.anonymousName },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, anonymousName: user.anonymousName, userId: user._id.toString(), avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { avatar, anonymousName } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (avatar !== undefined) user.avatar = avatar;
    if (anonymousName !== undefined) user.anonymousName = anonymousName;

    await user.save();
    
    // Refresh token with new anonymousName
    const token = jwt.sign(
      { id: user._id, anonymousName: user.anonymousName },
      SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({ message: "Profile updated", token, user: { anonymousName: user.anonymousName, avatar: user.avatar, id: user._id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;