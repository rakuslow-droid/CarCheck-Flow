import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      // 404エラーの原因となっていた apiVersion: ["v1"] を削除しました。
      // これにより、Gemini 1.5 シリーズが正しく動作する v1beta が使用されます。
    }),
  ],
});

console.log("Checking API Key setup... Key found!");
