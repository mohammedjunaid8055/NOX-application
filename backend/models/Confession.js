import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    content: { type: String, required: true, maxlength: 280 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    anonymousName: { type: String, default: "Anonymous" },
  },
  { timestamps: true }
);

const confessionSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, maxlength: 280 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    anonymousName: { type: String, default: "Anonymous" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [replySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Confession", confessionSchema);