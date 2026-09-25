import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import { connectDB } from "@/lib/db";
import { Chunk } from "@/models/Chunk";

export async function GET() {
  try {
    await connectDB();
    const totalChunks = await Chunk.countDocuments();
    const first = await Chunk.findOne().lean();
    const indexes = await Chunk.listSearchIndexes();
    return Response.json({
      database: Chunk.db.name,
      collection: Chunk.collection.name,
      totalChunks,
      embeddingLength: first?.embedding?.length ?? null,
      searchIndexes: indexes.map((i) => ({
        name: i.name,
        status: i.status,
        queryable: i.queryable,
        definition: i.latestDefinition,
      })),
    });
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    const message = error instanceof Error ? error.message : "Debug failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
