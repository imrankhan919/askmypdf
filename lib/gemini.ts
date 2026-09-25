import { GoogleGenAI } from "@google/genai";
import { CHAT_MODEL, EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "./config";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in .env.local");
  }
  return new GoogleGenAI({ apiKey });
}

type TaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

async function embed(texts: string[], taskType: TaskType): Promise<number[][]> {
  const ai = getClient();
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: texts,
    config: { taskType, outputDimensionality: EMBEDDING_DIMENSIONS },
  });
  const vectors = (response.embeddings ?? []).map((e) => e.values ?? []);
  if (vectors.length !== texts.length) {
    throw new Error(
      `Expected ${texts.length} embeddings, got ${vectors.length}`,
    );
  }
  return vectors;
}

export async function embedDocuments(chunks: string[]): Promise<number[][]> {
  const BATCH_SIZE = 20;
  const all: number[][] = [];
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    all.push(...(await embed(batch, "RETRIEVAL_DOCUMENT")));
  }
  return all;
}

export async function embedQuestion(question: string): Promise<number[]> {
  const [vector] = await embed([question], "RETRIEVAL_QUERY");
  return vector;
}
