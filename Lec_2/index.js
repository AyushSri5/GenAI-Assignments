import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PERSONAS } from "./personas.js";
import { generateReply } from "./llm.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 4000;

app.post("/api/chat", async (req, res) => {
  try {
    const { persona , message } = req.body || {};
    if (!message) return res.status(400).json({ error: "message required" });

    const p = PERSONAS[persona];
    console.log(`Using persona: ${p.name}`);
    const text = await generateReply({
      apiKey: process.env.OPENAI_API_KEY,
      system: p.system,
      user: message
    });

    res.json({ text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));