import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import { chunkText } from "@/lib/chunker";
import { connectDB } from "@/lib/db";
import { pdfToText } from "@/lib/pdf";
import { Chunk } from "@/models/Chunk";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json(
        { error: "Please attach a PDF file" },
        { status: 400 },
      );
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return Response.json(
        { error: "Only .pdf files are allowed" },
        { status: 400 },
      );
    }
    if (file.size > 4 * 1024 * 1024) {
      return Response.json(
        { error: "File must be smaller than 4 MB" },
        { status: 400 },
      );
    }

    const text = await pdfToText(await file.arrayBuffer());
    if (!text.trim()) {
      return Response.json(
        {
          error: "No text found. Is this a scanned PDF? Try a text-based PDF.",
        },
        { status: 422 },
      );
    }

    const pieces = chunkText(text);

    await connectDB();
    await Chunk.deleteMany({ filename: file.name });
    await Chunk.insertMany(
      pieces.map((piece, i) => ({
        filename: file.name,
        chunkIndex: i,
        text: piece,
      })),
    );

    return Response.json({ filename: file.name, chunks: pieces.length });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
