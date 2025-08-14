import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PERSONAS, PersonaKey } from "@/lib/personas";

const client = new OpenAI(); // reads OPENAI_API_KEY from env

export async function POST(req: NextRequest) {
  try {
    const { persona = "hitesh", message } = await req.json() as { persona?: PersonaKey; message: string; };

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    const p = PERSONAS[(persona as PersonaKey) || "hitesh"];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: p.system },
        { role: "user", content: message }
      ],
      temperature: 0.7
    });

    const text = completion.choices?.[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ text });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
