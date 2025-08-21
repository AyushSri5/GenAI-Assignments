import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
import { compile } from "html-to-text";
import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";


export async function POST(req){
    try{
    const { url } = await req.json();

    const compiledConvert = compile({ wordwrap: 130 }); // returns (text: string) => string;
    

const loader = new RecursiveUrlLoader(url, {
  extractor: compiledConvert,
  maxDepth: 1,
  excludeDirs: ["/docs/api/"],
});
const docs = await loader.load();
const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(docs);
console.log("Loaded documents:", docs);

const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });

    const vectorStore = await QdrantVectorStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "notebook-llm",
      }
    );
    console.log("Indexing of documents completed");
return  NextResponse.json({
    message: "Website url uploaded successfully",
    });
}
catch (error) {
        console.error("Error processing Website URL:", error);
        return  NextResponse.json("Failed to process YouTube URL", { status: 500 });
    }
}