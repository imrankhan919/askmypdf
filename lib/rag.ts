import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import { TOP_K, VECTOR_INDEX_NAME } from "./config";
import { connectDB } from "./db";
import { embedQuestion, generateText } from "./gemini";
import { Chunk } from "@/models/Chunk";

export type Source = {
  filename: string;
  chunkIndex: number;
  text: string;
  score: number;
};
// STEP 1 - Retrieval: question ke sabse paas ke chunks dhundo
export async function findRelevantChunks(question: string): Promise<Source[]> {
  await connectDB();
  const queryVector = await embedQuestion(question);
  return Chunk.aggregate<Source>([
    {
      $vectorSearch: {
        index: VECTOR_INDEX_NAME,
        path: "embedding",
        queryVector,
        numCandidates: TOP_K * 20,
        limit: TOP_K,
      },
    },
    {
      $project: {
        _id: 0,
        filename: 1,
        chunkIndex: 1,
        text: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);
}

// STEP 2 - Prompt banao: rules + chunks + question
export function buildPrompt(question: string, sources: Source[]): string {
  const context = sources
    .map(
      (s, i) => `[${i + 1}] (${s.filename}, chunk ${s.chunkIndex})\n${s.text}`,
    )
    .join("\n\n");

  return `You are a helpful assistant. Answer the question using ONLY the context below.
If the answer is not in the context, reply exactly:
"I couldn't find this in the uploaded documents."
Do not use outside knowledge. Mention the source numbers you used, like [1] or [2].
CONTEXT:
${context}
QUESTION: ${question}`;
}
// STEP 3 - Generation: Gemini se jawab lo
export async function askQuestion(question: string) {
  const sources = await findRelevantChunks(question);
  if (sources.length === 0) {
    const total = await Chunk.countDocuments();
    return {
      answer:
        total === 0
          ? "No documents found. Please upload a PDF first."
          : "PDF is saved but vector search found nothing. Check the Atlas index.",
      sources: [],
    };
  }

  const answer = await generateText(buildPrompt(question, sources));
  return { answer, sources };
}
