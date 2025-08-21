import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

export async function POST(req) {
    try{
    const { url } = await req.json();
    const loader = YoutubeLoader.createFromUrl(url, {
  language: "en",
  addVideoInfo: true,
});

const docs = await loader.load();

const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });

    const vectorStore = await QdrantVectorStore.fromDocuments(
      docs,
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "notebook-llm",
      }
    );
    console.log("Indexing of documents completed");
return new Response({
    message: "Youtube url uploaded successfully",
    });
}
    catch (error) {
        console.error("Error processing YouTube URL:", error);
        return new Response("Failed to process YouTube URL", { status: 500 });
    }
}