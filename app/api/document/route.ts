import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import { connectDB } from "@/lib/db";
import { Chunk } from "@/models/Chunk";
export async function GET() {
  try {
    await connectDB();
    const files = await Chunk.aggregate([
      { $group: { _id: "$filename", chunks: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    return Response.json(
      files.map((f) => ({ filename: f._id, chunks: f.chunks })),
    );
  } catch (error) {
    console.error("DOCUMENTS ERROR:", error);
    return Response.json(
      { error: "Could not load documents" },
      { status: 500 },
    );
  }
}
