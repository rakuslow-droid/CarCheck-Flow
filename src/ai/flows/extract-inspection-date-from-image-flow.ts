// src/ai/flows/extract-inspection-date-from-image-flow.ts
"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const ExtractInspectionDateFromImageOutputSchema = z.object({
  inspectionDate: z.string(),
  isCertificate: z.boolean(),
  extractedText: z.string().optional(),
  confidence: z.number().optional(),
});

export async function extractInspectionDateFromImage(input: {
  imageDataUri: string;
}) {
  // 修正：モデル名を 'gemini-1.5-flash-002' に固定します
  const { output } = await ai.generate({
    model: "googleai/gemini-1.5-flash-002",
    prompt: [
      {
        text: `あなたは日本の車検書類の専門家です。
        提供された画像（車検ステッカー）から「有効期間の満了する日」を抽出してください。
        大きな数字が月、右上の小さな数字が年（和暦）です。
        西暦（YYYY-MM-DD）に変換して、JSON形式で回答してください。`,
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
