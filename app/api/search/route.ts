import { findRelevantChunks } from "@/lib/rag";
// Sirf testing ke liye: sabse relevant chunks dekhne ka route
// Use: http://localhost:3000/api/search?q=refund policy
export async function GET(request: Request) {
  try {
    const q = new URL(request.url).searchParams.get("q")?.trim();
    if (!q) {
      return Response.json(
        { error: "Use /api/search?q=your question" },
        { status: 400 },
      );
    }
    const sources = await findRelevantChunks(q);
    return Response.json(sources);
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    const message = error instanceof Error ? error.message : "Search failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
