import { del, list } from "@vercel/blob";
import { db } from "../db";
import { images } from "../db/schema";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Deleting all images from the database...");
  await db.delete(images);
  console.log("All images deleted from the database.");

  console.log("Deleting all images from the blob store...");
  const { blobs } = await list();
  for (const blob of blobs) {
    await del(blob.url);
    console.log(`Deleted ${blob.pathname}`);
  }
  console.log("All images deleted from the blob store.");
}

main().catch(console.error);
