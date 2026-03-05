import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
  // 文字列で指定。プロバイダー名（googleAI/）を必ず含めます
  model: "googleAI/gemini-1.5-flash",
});

console.log("Checking API Key setup... Key found!");
