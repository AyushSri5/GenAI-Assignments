import OpenAI from "openai";
import { playAudio } from "openai/helpers/audio";
import 'dotenv/config';

const openai = new OpenAI();

const response = await openai.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "coral",
  input: "I love you baby",
  instructions: "Speak in a hot tone.",
//   response_format: "wav",
});

await playAudio(response);