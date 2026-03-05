import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      apiVersion: "v1beta",
    }),
  ],
  model: "google-genai/gemini-1.5-flash", // プレフィックスを追加
});
