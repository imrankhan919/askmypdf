import { CHUNK_OVERLAP, CHUNK_SIZE } from "./config";

export function chunkText(
  text: string,
  size = CHUNK_SIZE,
  overlap = CHUNK_OVERLAP,
): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];

  let start = 0;

  while (start < clean.length) {
    let end = Math.min(start + size, clean.length);
    if (end < clean.length) {
      const lastSpace = clean.lastIndexOf(" ", end);
      if (lastSpace > start + overlap) end = lastSpace;
    }

    chunks.push(clean.slice(start, end).trim());
    if (end >= clean.length) break;
    start = end - overlap;
  }

  return chunks;
}
