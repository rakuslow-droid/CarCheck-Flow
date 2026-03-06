// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      apiVersion: ["v1"], // 明示的に安定版を指定
    }),
  ],
});

console.log("Checking API Key setup... Key found!");
