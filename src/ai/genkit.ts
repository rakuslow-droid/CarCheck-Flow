import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
  plugins: [googleAI()],
  // 修正：プロバイダー名 'googleAI/' を先頭に付加
  model: "googleAI/gemini-1.5-flash-latest",
});
