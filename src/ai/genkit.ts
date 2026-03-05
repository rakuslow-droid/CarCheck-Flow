// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI, gemini15Flash } from "@genkit-ai/googleai";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      apiVersion: "v1beta",
    }),
  ],
  // 修正：文字列ではなく定数を指定
  model: gemini15Flash,
});

console.log("Checking API Key setup... Key found!");
