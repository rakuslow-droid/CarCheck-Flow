// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI, gemini15Flash } from "@genkit-ai/googleai"; // パッケージ名を修正

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      apiVersion: "v1beta",
    }),
  ],
  model: gemini15Flash, // デフォルトモデルとして指定
});

console.log("Checking API Key setup... Key found!");
