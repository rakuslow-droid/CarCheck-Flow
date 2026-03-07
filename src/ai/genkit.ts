// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

/**
 * Global Genkit instance configuration.
 * Uses a placeholder for GEMINI_API_KEY if missing to prevent 
 * module-level crashes during build/pre-rendering phases.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-build-stability",
    }),
  ],
  model: "googleai/gemini-1.5-flash",
});
