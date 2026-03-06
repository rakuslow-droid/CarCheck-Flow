// src/ai/flows/extract-inspection-date-from-image-flow.ts
"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const ExtractInspectionDateFromImageOutputSchema = z.object({
  inspectionDate: z.string(),
  isCertificate: z.boolean(),
  extractedText: z.string().optional(),
});

export async function extractInspectionDateFromImage(input: {
  imageDataUri: string;
}) {
  console.log("DEBUG: AI extraction started with v1 endpoint...");

  const { output } = await ai.generate({
    // モデル名からプレフィックスを外し、プラグインに解決させます
    model: "googleai/gemini-1.5-flash",
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
