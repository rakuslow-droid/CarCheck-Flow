// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
  plugins: [googleAI()],
  // 修正ポイント：インポート不要の文字列指定に変更します
  model: "googleai/gemini-1.5-flash",
});
