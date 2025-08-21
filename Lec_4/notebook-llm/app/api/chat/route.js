import { NextRequest, NextResponse } from "next/server";
import { embeddings, openai } from "@/lib/embeddings";
import { qdrant } from "@/lib/qdrant";

export async function POST(req) {
    try {
  const { query } = await req.json();

  const [vector] = await embeddings.embedDocuments([query]);

  // Search relevant docs
  const results = qdrant.asRetriever();
  const docs = await results.invoke(query);
  console.log("Relevant documents:", docs);

  const context = docs
    .map((r) => r.payload ? `Page ${r.payload.page}: ${r.payload.text}` : "")
    .filter((text) => text !== "")
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `You are an AI assistant who helps resolving user query based on the
    context available to you from a PDF file with the content and page number.
    Only ans based on the available context from file only.
    Context:
    ${JSON.stringify(docs)}
    ` },
      { role: "user", content: `Question: ${query}` },
    ],
  });

  return NextResponse.json({ answer: completion.choices[0].message.content });
}
catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
  }
}
