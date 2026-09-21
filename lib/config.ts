// Saari settings ek jagah. Model badalna ho to sirf yahan badlo.
export const DB_NAME = "askmypdf";
// Gemini models
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768; // Atlas index mein bhi 768 hi likhna hai
export const CHAT_MODEL = "gemini-3.8-flash";
// MongoDB Atlas vector index ka naam (Atlas UI mein yahi naam rakhenge)
export const VECTOR_INDEX_NAME = "vector_index";
// Chunking
export const CHUNK_SIZE = 1000; // characters
export const CHUNK_OVERLAP = 200; // characters
// Question ke liye kitne chunks laane hain
export const TOP_K = 4;
