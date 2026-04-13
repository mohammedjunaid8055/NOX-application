import express from "express";
import Confession from "../models/Confession.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET all confessions with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Default limit 20
    const skip = (page - 1) * limit;

    const total = await Confession.countDocuments();
    const confessions = await Confession.find()
      .populate('userId', 'avatar anonymousName')
      .populate('replies.userId', 'avatar anonymousName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      confessions,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create confession (auth required)
router.post("/", auth, async (req, res) => {
  try {
    const { content, image } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Content is required" });

    const confession = new Confession({
      content: content.trim(),
      image: image || "",
      userId: req.user.id,
      anonymousName: req.user.anonymousName,
    });

    await confession.save();
    const populated = await Confession.findById(confession._id).populate('userId', 'avatar anonymousName');
    res.json({ message: "Posted", confession: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT edit confession (auth required)
router.put("/:id", auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Content is required" });
    
    const confession = await Confession.findById(req.params.id);
    if (!confession) return res.status(404).json({ message: "Not found" });

    if (confession.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to edit this confession" });
    }

    confession.content = content.trim();
    await confession.save();
    
    // Return populated
    const populated = await Confession.findById(confession._id).populate('userId', 'avatar anonymousName');
    res.json({ message: "Edited", confession: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE delete confession (auth required)
router.delete("/:id", auth, async (req, res) => {
  try {
    const confession = await Confession.findById(req.params.id);
    if (!confession) return res.status(404).json({ message: "Not found" });

    if (confession.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this confession" });
    }

    await Confession.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
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

    // Populate the newly added reply's userId
    await confession.populate('replies.userId', 'avatar anonymousName');
    const saved = confession.replies[confession.replies.length - 1];
    
    res.json({ message: "Reply added", reply: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;