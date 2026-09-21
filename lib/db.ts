import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import { DB_NAME } from "./config";
// Next.js dev mode mein files baar-baar reload hoti hain.
// Isliye connection ko `globalThis` pe rakhte hain taaki har reload pe naya na bane.
const globalForMongoose = globalThis as unknown as {
  mongooseConn?: Promise<typeof mongoose>;
};
export function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing in .env.local");
  }
  if (!globalForMongoose.mongooseConn) {
    globalForMongoose.mongooseConn = mongoose
      .connect(uri, { dbName: DB_NAME })
      .catch((error) => {
        // Connect fail hua? Cache saaf karo taaki next request dobara try kare
        globalForMongoose.mongooseConn = undefined;
        throw error;
      });
  }
  return globalForMongoose.mongooseConn;
}
