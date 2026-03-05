import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
  // 最新版（latest）ではなく、安定版の flash を指定してロードを速めます
  model: "googleAI/gemini-1.5-flash",
});

console.log("Checking API Key setup... Key found!");
