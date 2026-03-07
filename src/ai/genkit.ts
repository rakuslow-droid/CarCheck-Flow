// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

/**
 * Global Genkit instance configuration.
 * Uses GOOGLE_GENAI_API_KEY for authorization.
 * Model set to gemini-3-flash-preview as per project requirements.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || "dummy-key-for-build-stability",
    }),
  ],
  model: "googleai/gemini-3-flash-preview",
});
