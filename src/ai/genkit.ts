import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
  // 修正：最もシンプルで標準的な名前にします
  model: "gemini-1.5-flash",
});

console.log("Checking API Key setup... Key found!");
