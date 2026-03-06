// src/ai/flows/extract-inspection-date-from-image-flow.ts
"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const ExtractInspectionDateFromImageInputSchema = z.object({
  imageDataUri: z.string(),
});

const ExtractInspectionDateFromImageOutputSchema = z.object({
  inspectionDate: z.string(),
  isCertificate: z.boolean(),
  extractedText: z.string().optional(),
  confidence: z.number().optional(),
});

const extractPrompt = ai.definePrompt({
  name: "extractInspectionDateFromImagePrompt",
  input: { schema: ExtractInspectionDateFromImageInputSchema },
  output: { schema: ExtractInspectionDateFromImageOutputSchema },
  prompt: [
    {
      text: `あなたは日本の車検書類の専門家です。
      画像から「有効期間の満了する日」を抽出してください。
      和暦は西暦（YYYY-MM-DD）に変換してください。
      JSON形式で回答してください。`,
    },
    {
      media: {
        url: "{{input.imageDataUri}}",
        contentType: "image/jpeg",
      },
    },
  ],
});

export async function extractInspectionDateFromImage(input: {
  imageDataUri: string;
}) {
  // 修正：定義したプロンプト(extractPrompt)を直接呼び出します
  const { output } = await extractPrompt(input);

  if (!output) {
    throw new Error("AI extraction failed to produce output");
  }

  return output;
}
