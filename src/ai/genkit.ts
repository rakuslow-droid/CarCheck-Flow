import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
  plugins: [
    // 環境変数から直接読み込むように明示します
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  // モデル名も、最も標準的なプロバイダー付きに戻します
  model: "googleAI/gemini-1.5-flash-latest",
});

// デバッグ用：サーバー起動時にキーが読み込まれているかログに出します
console.log(
  "Checking API Key setup...",
  process.env.GOOGLE_GENAI_API_KEY ? "Key found!" : "Key is missing!",
);
