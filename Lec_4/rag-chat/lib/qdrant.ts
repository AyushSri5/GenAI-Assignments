import { QdrantClient } from "@qdrant/qdrant-js";
export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
});
