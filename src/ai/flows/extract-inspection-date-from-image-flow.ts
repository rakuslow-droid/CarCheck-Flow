'use server';
/**
 * @fileOverview A Genkit flow for extracting the inspection date from a vehicle inspection certificate or sticker image.
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
      "A photo of a vehicle's inspection certificate or sticker, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractInspectionDateFromImageInput = z.infer<
  typeof ExtractInspectionDateFromImageInputSchema
>;

const ExtractInspectionDateFromImageOutputSchema = z.object({
  inspectionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("The extracted vehicle inspection date in YYYY-MM-DD format. If no date is found, this field should be an empty string."),
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
  prompt: `You are an expert at reading vehicle inspection certificates and stickers. Your task is to accurately extract the inspection date from the provided image.

The inspection date is usually clearly marked on the document or sticker. You must provide the date in YYYY-MM-DD format.
If you cannot find a clear inspection date, set the 'inspectionDate' field to an empty string.

Respond in the JSON format as described by the output schema.

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
