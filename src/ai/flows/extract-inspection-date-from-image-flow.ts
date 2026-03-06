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
  const { output } = await ai.generate({
    // 修正：モデル識別子のみを指定
    model: "googleai/gemini-1.5-flash",
    prompt: [
      {
        text: `あなたは日本の自動車整備業界の専門家です。
        提供された画像から「有効期間の満了する日」を抽出し、YYYY-MM-DD形式のJSONで回答してください。`,
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
    throw new Error("AI extraction failed to produce output");
  }

  return output;
}
