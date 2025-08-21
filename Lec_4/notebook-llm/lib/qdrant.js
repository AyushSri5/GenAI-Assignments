
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { embeddings } from "./embeddings";


export const qdrant = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL || "http://localhost:6333",
  collectionName: "notebook-llm", // Ensure this matches your collection name
});