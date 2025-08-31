import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export async function POST(request) {
    const {query,image_url} = await request.json();
    console.log("Query received:", query,image_url);

    const result = await fal.subscribe("fal-ai/nano-banana/edit", {
  input: {
    prompt: query,
    image_urls: [image_url[0].imageKitUrl]
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});
console.log(result.data);
console.log(result.requestId);
  return NextResponse.json({ message: result.data.images[0] });
}