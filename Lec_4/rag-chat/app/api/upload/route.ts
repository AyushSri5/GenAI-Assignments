import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs/promises";
import pdf from "pdf-parse";
import { embeddings } from "@/lib/embeddings";
import { qdrant } from "@/lib/qdrant";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const form = formidable({ multiples: false });
  const data = await new Promise<any>((resolve, reject) => {
    form.parse(req.body as any, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

  const file: any = data.files.file[0];
  const buffer = await fs.readFile(file.filepath);
  const pdfData = await pdf(buffer);
  console.log(`PDF parsed: ${pdfData.text} characters.`);

  // Page-wise chunking
  const pages = pdfData.text.split("\n\n").filter(Boolean);
  console.log(`Extracted ${pages} pages from PDF.`);
  let vectors: any[] = [];
return NextResponse.json({ status: "ok", pages: pages.length });
  for (let i = 0; i < pages.length; i++) {
    const text = pages[i];
    const [vector] = await embeddings.embedDocuments([text]);

    vectors.push({
      vector,
      payload: {
        page: i + 1,
        text,
        filename: file.originalFilename,
        uploadedAt: new Date().toISOString(),
      },
    });
  }

  // Ensure collection exists
  await qdrant.createCollection("rag_store", {
    vectors: { size: 1536, distance: "Cosine" },
  }).catch(() => {}); // ignore if exists

  // Insert with indexing
  await qdrant.upsert("rag_store", {
    points: vectors.map((v, idx) => ({
      id: `${file.originalFilename}-${idx}`,
      vector: v.vector,
      payload: v.payload,
    })),
  });

  return NextResponse.json({ status: "ok", pages: pages.length });
}
