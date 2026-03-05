// src/ai/flows/extract-inspection-date-from-image-flow.ts
"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const ExtractInspectionDateFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a vehicle's inspection certificate (車検証) or sticker (車検ステッカー), as a data URI.",
    ),
});

const ExtractInspectionDateFromImageOutputSchema = z.object({
  inspectionDate: z
    .string()
    .describe(
      "The extracted vehicle inspection date (有効期間の満了する日) in YYYY-MM-DD format.",
    ),
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
      text: `You are an expert at reading Japanese vehicle inspection documents. 
      Extract the "有効期間の満了する日" (Inspection Expiration Date).
      Convert Japanese Imperial dates (e.g., Reiwa) to YYYY-MM-DD.
      Respond in JSON.`,
    },
    // 修正：url文字列ではなく、メディアオブジェクトとして渡す
    {
      media: {
        url: "{{input.imageDataUri}}",
        // 下記のように指定することで、Data URIからContentTypeを自動判別させます
        // もしエラーが続く場合は 'image/jpeg' と直接書くことも可能です
      },
    },
  ],
});

export async function extractInspectionDateFromImage(input: {
  imageDataUri: string;
}) {
  // Genkitの仕様により、mediaパーツを含む場合は明示的にパーツとして組み立てて呼ぶ方が確実です
  const { output } = await extractPrompt(input);

  if (!output) {
    throw new Error("AI extraction failed");
  }

  return output;
}
