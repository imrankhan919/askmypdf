"use client";
import { useEffect, useState } from "react";
type Doc = { filename: string; chunks: number };
type Source = { filename: string; chunkIndex: number; text: string; score: number };
export default function Home() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState("");
  async function loadDocs() {
    const res = await fetch("/api/documents");
    if (res.ok) setDocs(await res.json());
  }
  // Page khulte hi uploaded files ki list lao
  useEffect(() => {
    fetch("/api/documents")
      .then((res) => (res.ok ? res.json() : []))
      .then(setDocs);
  }, []);

  async function handleUpload() {
    if (!file) return;
    console.log(file)
    setUploading(true);
    setUploadMsg("Reading PDF, creating chunks and embeddings... please wait");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUploadMsg(`Done! ${data.filename} saved as ${data.chunks} chunks.`);
      loadDocs();
    } catch (err) {
      setUploadMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }
  async function handleAsk() {
    if (!question.trim()) return;
    setAsking(true);
    setAskError("");
    setAnswer("");
    setSources([]);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnswer(data.answer);
      setSources(data.sources);
    } catch (err) {
      setAskError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAsking(false);
    }
  }
  return (
    <main>
      <h1>AskMyPDF</h1>
      <p className="subtitle">
        Upload a PDF, then ask questions. Answers come with sources.
      </p>
      <section className="card">
        <h2>1. Upload a PDF</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? "Processing..." : "Upload"}
        </button>
        {uploadMsg && <p className="status">{uploadMsg}</p>}
        {docs.length > 0 && (
          <p className="status">
            Uploaded: {docs.map((d) => `${d.filename} (${d.chunks} chunks)`).join(", ")}
          </p>
        )}
      </section>
      <section className="card">
        <h2>2. Ask a question</h2>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="e.g. What is the refund policy?"
        />
        <button onClick={handleAsk} disabled={asking || !question.trim()}>
          {asking ? "Thinking..." : "Ask"}
        </button>
        {askError && <p className="status error">{askError}</p>}
      </section>
      {answer && (
        <section className="card">
          <h2>Answer</h2>
          <div className="answer">{answer}</div>
          <h2 style={{ marginTop: 20 }}>Sources</h2>
          {sources.map((s, i) => (
            <div className="source" key={i}>
              <strong>[{i + 1}] {s.filename}</strong>{" "}
              <small>chunk {s.chunkIndex} - score {s.score.toFixed(3)}</small>
              <p>{s.text.slice(0, 220)}...</p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}