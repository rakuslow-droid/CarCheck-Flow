// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI, gemini15Flash } from "@genkit-ai/googleai";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  // 修正：文字列ではなく、インポートした定数「gemini15Flash」を直接渡します
  model: gemini15Flash,
});

console.log("Checking API Key setup... Key found!");
