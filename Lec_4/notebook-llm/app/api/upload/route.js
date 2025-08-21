import {  NextResponse } from "next/server";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";

// Convert Web ReadableStream → Node Readable
async function toNodeStream(webStream) {
  const reader = webStream.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(Buffer.from(value));
      }
    },
  });
}

const parseForm = async (req) => {
  const uploadDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
  });

  const nodeReq = await toNodeStream(req.body); // convert NextRequest.body
  // formidable needs headers to parse multipart
  (nodeReq).headers = Object.fromEntries(req.headers);

  return new Promise(
    (resolve, reject) => {
      form.parse(nodeReq, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    }
  );
};

export async function POST(req) {
  try {
    const { files } = await parseForm(req);
    // console.log("Received file:", formData.get("file"));
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file; // field name = "file"
    if (!uploadedFile) {
      throw new Error("No file uploaded");
    }
    const pdfFilePath = uploadedFile.filepath;
    console.log("PDF file path:", pdfFilePath);
    
    const loader = new PDFLoader(pdfFilePath);
    const docs = await loader.load();

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });
    console.log(docs);

    const vectorStore = await QdrantVectorStore.fromDocuments(
      docs,
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "notebook-llm",
      }
    );
    console.log("Indexing of documents completed");
    return NextResponse.json({
      message: "File uploaded successfully",
      file: {
        name: uploadedFile.originalFilename,
        path: uploadedFile.filepath,
        size: uploadedFile.size,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
