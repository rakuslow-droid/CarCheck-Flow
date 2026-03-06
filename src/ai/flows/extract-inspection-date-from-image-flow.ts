"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";
// モデルオブジェクトを直接インポート
import { gemini15Flash } from "@genkit-ai/googleai";

const ExtractInspectionDateFromImageOutputSchema = z.object({
  inspectionDate: z.string(),
  isCertificate: z.boolean(),
  extractedText: z.string().optional(),
});

export async function extractInspectionDateFromImage(input: {
  imageDataUri: string;
}) {
  console.log("DEBUG: AI extraction started with correct model object...");

  const { output } = await ai.generate({
    // 文字列 "googleai/gemini-1.5-flash" の代わりにオブジェクトを渡します
    model: "googleai/gemini-3-flash-preview",
    prompt: [
      {
        text: "この画像から車検の「有効期間の満了する日」を抜き出し、YYYY-MM-DD形式のJSONで回答してください。",
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

  console.log("DEBUG: AI Extraction Success:", output.inspectionDate);
  return output;
}
