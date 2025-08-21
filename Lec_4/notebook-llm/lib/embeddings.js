import OpenAI from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
// Relational mapping causes small not working
export const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  openAIApiKey: process.env.OPENAI_API_KEY,
});
