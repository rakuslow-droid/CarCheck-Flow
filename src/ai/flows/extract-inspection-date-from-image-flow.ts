// src/ai/flows/extract-inspection-date-from-image-flow.ts
"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

/**
 * AIからの抽出結果のスキーマ定義
 */
const ExtractInspectionDateFromImageOutputSchema = z.object({
  inspectionDate: z.string().describe("車検満了日 (YYYY-MM-DD形式)"),
  isCertificate: z
    .boolean()
    .describe("画像が車検関連の書類やステッカーであるか"),
  extractedText: z
    .string()
    .optional()
    .describe("画像から読み取った生のテキスト"),
  confidence: z.number().optional().describe("抽出の確信度 (0-1)"),
});

/**
 * 画像から車検日を抽出するAIフロー
 */
export async function extractInspectionDateFromImage(input: {
  imageDataUri: string;
}) {
  // 修正ポイント:
  // 1. モデル名を "googleai/gemini-1.5-flash" と明示的に指定
  // 2. definePrompt を介さず直接 generate を実行してURL構築エラーを防止
  const { output } = await ai.generate({
    model: "googleai/gemini-1.5-flash",
    prompt: [
      {
        text: `あなたは日本の自動車整備業界の専門家です。
        提供された画像（車検ステッカーまたは車検証）から「有効期間の満了する日」を抽出してください。
        
        【ステッカーの読み取りルール】
        - 中央の大きな数字：満了する「月」
        - 右上の小さな数字：満了する「年（和暦）」
        
        【出力ルール】
        - 和暦は必ず西暦（YYYY-MM-DD）に変換してください。
        - JSON形式で回答してください。`,
      },
      {
        media: {
          url: input.imageDataUri,
          contentType: "image/jpeg",
        },
      },
    ],
    output: { schema: ExtractInspectionDateFromImageOutputSchema },
  });

  if (!output) {
    console.error("DEBUG: AI produced no output.");
    throw new Error("AI extraction failed to produce output");
  }

  return output;
}
