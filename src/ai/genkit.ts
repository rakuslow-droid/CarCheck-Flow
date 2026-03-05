import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

export const ai = genkit({
  plugins: [googleAI()],
  // 文字列で指定し、googleAI/ を頭に付けることで
  // 変数が見つからないエラーを回避します
  model: "googleAI/gemini-1.5-flash-latest",
});
