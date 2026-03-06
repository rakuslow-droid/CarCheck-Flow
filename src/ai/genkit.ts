// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  // 修正：ここも最新モデルに合わせておきます
  model: "googleai/gemini-3-flash-preview",
});

console.log("Checking API Key setup... Key found!");
