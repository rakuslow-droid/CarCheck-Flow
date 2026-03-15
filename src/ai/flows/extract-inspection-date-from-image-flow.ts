"use server";
/**
 * @fileOverview AI Flow for extracting vehicle inspection dates from Japanese documents.
 *
 * - extractInspectionDateFromImage - Wrapper function for the AI flow.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const ExtractInspectionDateFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "Base64 encoded image data URI of the vehicle inspection document.",
    ),
});

const ExtractInspectionDateFromImageOutputSchema = z.object({
  inspectionDate: z
    .string()
    .describe("The extracted inspection expiration date in YYYY-MM-DD format."),
  isCertificate: z
    .boolean()
    .describe(
      "Whether the document was identified as a valid vehicle inspection certificate or sticker.",
    ),
  extractedText: z
    .string()
    .optional()
    .describe("Supporting text found in the image."),
});

export type ExtractInspectionDateFromImageOutput = z.infer<
  typeof ExtractInspectionDateFromImageOutputSchema
>;

/**
 * Wrapper function for the extractInspectionDateFlow.
 */
export async function extractInspectionDateFromImage(input: {
  imageDataUri: string;
}): Promise<ExtractInspectionDateFromImageOutput> {
  return extractInspectionDateFlow(input);
}

const prompt = ai.definePrompt({
  name: "extractInspectionDatePrompt",
  model: "googleai/gemini-3-flash-preview", // ← configの外に出す
  input: { schema: ExtractInspectionDateFromImageInputSchema },
  output: { schema: ExtractInspectionDateFromImageOutputSchema },
  prompt: `You are an expert at reading Japanese vehicle documents (車検証 and 車検ステッカー).
Extract the "有効期間の満了する日" (expiration date) from the provided image.

Instructions:
1. Return the date in YYYY-MM-DD format.
2. Determine if the image is indeed a vehicle inspection related document.
3. Provide any relevant text snippets for verification.

Image: {{media url=imageDataUri}}`,
});

const extractInspectionDateFlow = ai.defineFlow(
  {
    name: "extractInspectionDateFlow",
    inputSchema: ExtractInspectionDateFromImageInputSchema,
    outputSchema: ExtractInspectionDateFromImageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("AI failed to extract data from the image.");
    }
    return output;
  },
);
