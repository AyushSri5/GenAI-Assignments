import { SRTLoader } from "@langchain/community/document_loaders/fs/srt";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { NextResponse } from "next/server";


export async function POST(req) {
    const { url } = await req.json();

    const loader = new SRTLoader(
  "09-node-architecture.vtt"
    );

const docs = await loader.load();

const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });

    const vectorStore = await QdrantVectorStore.fromDocuments(
      docs,
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "chatbot-llm",
      }
    );
    console.log("Indexing of documents completed");

console.log("Loaded documents:", docs);
return NextResponse.json({
    message: "SRT file processed successfully",
    });

}