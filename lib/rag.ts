import { TOP_K, VECTOR_INDEX_NAME } from "./config";
import { connectDB } from "./db";
import { embedQuestion } from "./gemini";
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
