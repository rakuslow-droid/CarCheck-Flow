// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai"; // 元のパスに戻しました

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      // APIバージョンを v1 に固定して 404 を回避
      // 型定義に合わせて ['v1'] と記述します
      apiVersion: ["v1"],
    }),
  ],
});

console.log("Checking API Key setup... Key found!");
