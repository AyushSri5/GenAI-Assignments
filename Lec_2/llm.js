import OpenAI from "openai";
import 'dotenv/config';
export async function generateReply({  system, user }) {
  const client = new OpenAI();

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    temperature: 0.7
  });

  return completion.choices?.[0]?.message?.content?.trim() ?? "";
}