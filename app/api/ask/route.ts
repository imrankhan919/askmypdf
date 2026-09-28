import { askQuestion } from "@/lib/rag";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question =
      typeof body.question === "string" ? body.question.trim() : "";
    if (!question) {
      return Response.json({ error: "Question is required" }, { status: 400 });
    }
    const result = await askQuestion(question);
    return Response.json(result); // { answer, sources }
  } catch (error) {
    console.error("ASK ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return Response.json({ error: message }, { status: 500 });
  }
}
