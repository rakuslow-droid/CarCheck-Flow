// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  // 修正：もっとも標準的なエイリアスを指定します
  model: "googleai/gemini-1.5-flash",
});
