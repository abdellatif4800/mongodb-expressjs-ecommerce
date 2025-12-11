import { Db, MongoClient } from 'mongodb';
import dotenv from "dotenv";

dotenv.config();
let db: Db;

export async function initDB() {
  try {
    const uri = process.env.MONGO_URI || ''
    const client = new MongoClient(uri);

    await client.connect();
    db = client.db('myDB');
    return db

  } catch (err) {
    console.error("❌ DB connection failed:", err);
    throw err
  }
}

export function getDB() {
  if (!db) throw new Error("❌ DB not initialized. Call initDB() first.");
  return db;
}
