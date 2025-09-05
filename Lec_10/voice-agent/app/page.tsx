'use client'
import { RealtimeSession } from "@openai/agents-realtime";
import axios from "axios";
import Image from "next/image";
import { gfAgent } from "./agents/gf";

export default function Home() {
  const handleStartAgent = async() => {
    const response = await axios.get("/api/voice");
    console.log("Response",response.data);
    
    const tempKey = response.data.tempApiKey;

    const session = new RealtimeSession(gfAgent, {
  model: 'gpt-4o-realtime-preview-2025-06-03',
  config:{
    inputAudioFormat: 'pcm16',
    inputAudioNoiseReduction: { type: 'near_field'},
    inputAudioTranscription: {
      language: 'en',
      model: 'gpt-4o-mini-transcribe'
    }
  }
});

  await session.connect({ apiKey: tempKey });
  }
  return (
    <div className="d-flex">
     <button
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            onClick={handleStartAgent}
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Talk to agent
          </button>
          </div>
  );
}
