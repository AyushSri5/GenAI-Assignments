import { connectDB } from "@/app/utils/connectDB";
import { SRTLoader } from "@langchain/community/document_loaders/fs/srt";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { NextResponse } from "next/server";


export async function POST(req) {
    const { url } = await req.json();
    // await connectDB();
  
    const loader = new SRTLoader(
  "./genai-cohort/nodejs/Subtitles_1/01-node-introduction.vtt"
    );

const docs = await loader.load();
console.log("Docs ",docs);


// const embeddings = new OpenAIEmbeddings({
//       model: "text-embedding-3-large",
//     });

//     const vectorStore = await QdrantVectorStore.fromDocuments(
//       docs,
//       embeddings,
//       {
//         url: "http://localhost:6333",
//         collectionName: "chatbot-llm",
//       }
//     );
//     console.log("Indexing of documents completed");

// console.log("Loaded documents:", docs);
return NextResponse.json({
    message: "SRT file processed successfully",
    });

}