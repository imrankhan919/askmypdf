import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    const mongoose = await connectDB();
    return Response.json({ ok: true, database: mongoose.connection.name });
  } catch (error) {
    console.error("HEALTH ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Connection failed";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
