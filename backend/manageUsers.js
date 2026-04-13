import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Confession from "./models/Confession.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// List all users
async function listUsers() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB\n");

  const users = await User.find().select("-password -avatar").lean();
  console.log("=== ALL USERS ===");
  for (const user of users) {
    const postCount = await Confession.countDocuments({ userId: user._id });
    console.log(`  ID: ${user._id}`);
    console.log(`  Name: ${user.anonymousName}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Posts: ${postCount}`);
    console.log("  ---");
  }
  console.log(`\nTotal: ${users.length} users`);
  await mongoose.disconnect();
}

// Delete a user and ALL their confessions + replies
async function deleteUser(userId) {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB\n");

  const user = await User.findById(userId).select("-password -avatar");
  if (!user) {
    console.log(`❌ User with id ${userId} not found`);
    await mongoose.disconnect();
    return;
  }

  console.log(`Found user: ${user.anonymousName} (${user.email})`);

  // Delete all their confessions
  const deletedConfessions = await Confession.deleteMany({ userId: user._id });
  console.log(`🗑️  Deleted ${deletedConfessions.deletedCount} confessions by this user`);

  // Remove their replies from other confessions
  const updatedConfessions = await Confession.updateMany(
    {},
    { $pull: { replies: { userId: user._id } } }
  );
  console.log(`🗑️  Removed their replies from ${updatedConfessions.modifiedCount} confessions`);

  // Remove their likes from confessions
  await Confession.updateMany(
    {},
    { $pull: { likes: user._id } }
  );

  // Delete the user account
  await User.findByIdAndDelete(userId);
  console.log(`✅ User "${user.anonymousName}" (${user.email}) permanently deleted`);

  await mongoose.disconnect();
}

// Show confessions by a specific user
async function showUserPosts(userId) {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB\n");

  const user = await User.findById(userId).select("-password -avatar");
  if (!user) {
    console.log(`❌ User with id ${userId} not found`);
    await mongoose.disconnect();
    return;
  }

  console.log(`=== Posts by ${user.anonymousName} (${user.email}) ===\n`);

  const confessions = await Confession.find({ userId: user._id })
    .select("content createdAt")
    .sort({ createdAt: -1 })
    .lean();

  for (const c of confessions) {
    console.log(`  ID: ${c._id}`);
    console.log(`  Content: "${c.content.substring(0, 80)}${c.content.length > 80 ? '...' : ''}"`);
    console.log(`  Date: ${c.createdAt}`);
    console.log("  ---");
  }
  console.log(`\nTotal: ${confessions.length} posts`);
  await mongoose.disconnect();
}

// --- CLI ---
const command = process.argv[2];
const arg = process.argv[3];

const help = `
Admin User Management Script
=============================
Usage: node manageUsers.js <command> [userId]

Commands:
  list              List all users with post counts
  posts <userId>    Show all confessions by a user
  delete <userId>   Delete user + all their confessions/replies/likes
  help              Show this help message

Examples:
  node manageUsers.js list
  node manageUsers.js posts 69d93d1e54fc0e46b0201ec8
  node manageUsers.js delete 69d93d1e54fc0e46b0201ec8
`;

switch (command) {
  case "list":
    listUsers();
    break;
  case "posts":
    if (!arg) { console.log("Please provide a userId"); break; }
    showUserPosts(arg);
    break;
  case "delete":
    if (!arg) { console.log("Please provide a userId"); break; }
    deleteUser(arg);
    break;
  default:
    console.log(help);
}
