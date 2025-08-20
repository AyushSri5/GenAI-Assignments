import { NextRequest, NextResponse } from "next/server";
import { embeddings, openai } from "@/lib/embeddings";
import { qdrant } from "@/lib/qdrant";

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  const [vector] = await embeddings.embedDocuments([query]);

  // Search relevant docs
  const results = await qdrant.search("rag_store", {
    vector,
    limit: 3,
  });

  const context = results
    .map((r) => r.payload ? `Page ${r.payload.page}: ${r.payload.text}` : "")
    .filter((text) => text !== "")
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant with access to a knowledge base." },
      { role: "user", content: `Context:\n${context}\n\nQuestion: ${query}` },
    ],
  });

  return NextResponse.json({ answer: completion.choices[0].message.content });
}
