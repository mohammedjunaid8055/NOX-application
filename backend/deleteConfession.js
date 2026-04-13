import mongoose from "mongoose";
import dotenv from "dotenv";
import Confession from "./models/Confession.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function deleteConfessions(ids) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    for (const id of ids) {
      const result = await Confession.findByIdAndDelete(id);
      if (result) {
        console.log(`✅ Deleted confession: "${result.content.substring(0, 50)}..."`);
      } else {
        console.log(`❌ Confession with id ${id} not found`);
      }
    }

    console.log("\nDone! Disconnecting...");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

// ---------- PUT THE IDs OF CONFESSIONS TO DELETE BELOW ----------
const idsToDelete = process.argv.slice(2);

if (idsToDelete.length === 0) {
  console.log("Usage: node deleteConfession.js <id1> <id2> ...");
  console.log("Example: node deleteConfession.js 69d93c9d54fc0e46b0201ebc");
  process.exit(0);
}

deleteConfessions(idsToDelete);
