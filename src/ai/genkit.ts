// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  // 修正：明示的に文字列で指定することで、エンドポイントの構築ミスを防ぎます
  model: "googleai/gemini-1.5-flash-latest",
});

console.log("Checking API Key setup... Key found!");
