import express from "express";
import Confession from "../models/Confession.js";

const router = express.Router();

// Create confession
router.post("/", async (req, res) => {
  try {
    const { content, userId } = req.body;

    const confession = new Confession({
      content,
      userId
    });

    await confession.save();

    res.json({ message: "Confession posted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all confessions (feed)
router.get("/", async (req, res) => {
  try {
    const confessions = await Confession.find().sort({ createdAt: -1 });

    res.json(confessions);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;