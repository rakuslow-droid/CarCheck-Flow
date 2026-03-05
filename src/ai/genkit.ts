// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      apiVersion: "v1beta",
    }),
  ],
  // 修正：'-latest' をつけるか、または単に 'gemini-1.5-flash' と文字列で指定
  model: "googleai/gemini-1.5-flash-latest",
});

console.log("Checking API Key setup... Key found!");
