
'use server';
/**
 * @fileOverview A Genkit flow for extracting the inspection date from a Japanese vehicle inspection certificate or sticker image.
 *
 * - extractInspectionDateFromImage - A function that handles the date extraction process.
 * - ExtractInspectionDateFromImageInput - The input type for the extractInspectionDateFromImage function.
 * - ExtractInspectionDateFromImageOutput - The return type for the extractInspectionDateFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInspectionDateFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a vehicle's inspection certificate (車検証) or sticker (車検ステッカー), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractInspectionDateFromImageInput = z.infer<
  typeof ExtractInspectionDateFromImageInputSchema
>;

const ExtractInspectionDateFromImageOutputSchema = z.object({
  inspectionDate: z
    .string()
    .describe("The extracted vehicle inspection date (有効期間の満了する日) in YYYY-MM-DD format. If no date is found, this field should be an empty string."),
  isCertificate: z.boolean().describe("True if the image is a vehicle inspection certificate (車検証), false if it's a sticker (車検ステッカー)."),
  extractedText: z.string().optional().describe("All text extracted from the image by the model, for verification purposes."),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .describe("A confidence score (0-1) indicating the model's certainty about the extracted date."),
});
export type ExtractInspectionDateFromImageOutput = z.infer<
  typeof ExtractInspectionDateFromImageOutputSchema
>;

export async function extractInspectionDateFromImage(
  input: ExtractInspectionDateFromImageInput
): Promise<ExtractInspectionDateFromImageOutput> {
  return extractInspectionDateFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractInspectionDateFromImagePrompt',
  input: {schema: ExtractInspectionDateFromImageInputSchema},
  output: {schema: ExtractInspectionDateFromImageOutputSchema},
  prompt: `You are an expert at reading Japanese vehicle inspection documents. Your task is to accurately extract the "有効期間の満了する日" (Inspection Expiration Date) from the provided image.

The image will be either a "車検証" (Vehicle Inspection Certificate) or a "車検ステッカー" (Inspection Sticker).
- On a certificate, look for the field labeled "有効期間の満了する日".
- On a sticker, look for the large numbers indicating the year and month.

You must provide the date in YYYY-MM-DD format. If the date is in the Japanese Imperial calendar (e.g., Reiwa 6), convert it to the Gregorian calendar (e.g., 2024).

Respond in JSON format.

Photo: {{media url=imageDataUri}}`,
});

const extractInspectionDateFromImageFlow = ai.defineFlow(
  {
    name: 'extractInspectionDateFromImageFlow',
    inputSchema: ExtractInspectionDateFromImageInputSchema,
    outputSchema: ExtractInspectionDateFromImageOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
