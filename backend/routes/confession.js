import express from "express";
import Confession from "../models/Confession.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET all confessions
router.get("/", async (req, res) => {
  try {
    const confessions = await Confession.find().sort({ createdAt: -1 });
    res.json(confessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create confession (auth required)
router.post("/", auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Content is required" });

    const confession = new Confession({
      content: content.trim(),
      userId: req.user.id,
      anonymousName: req.user.anonymousName,
    });

    await confession.save();
    res.json({ message: "Posted", confession });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST like / unlike
router.post("/like/:id", auth, async (req, res) => {
  try {
    const confession = await Confession.findById(req.params.id);
    if (!confession) return res.status(404).json({ message: "Not found" });

    const userId = req.user.id;
    const alreadyLiked = confession.likes.map((id) => id.toString()).includes(userId);

    if (alreadyLiked) {
      confession.likes = confession.likes.filter((id) => id.toString() !== userId);
    } else {
      confession.likes.push(userId);
    }

    await confession.save();
    res.json({ likesCount: confession.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST reply to a confession (auth required)
router.post("/:id/reply", auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Reply content is required" });

    const confession = await Confession.findById(req.params.id);
    if (!confession) return res.status(404).json({ message: "Confession not found" });

    const reply = {
      content: content.trim(),
      userId: req.user.id,
      anonymousName: req.user.anonymousName,
    };

    confession.replies.push(reply);
    await confession.save();

    const saved = confession.replies[confession.replies.length - 1];
    res.json({ message: "Reply added", reply: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;