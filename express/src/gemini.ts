import { GoogleGenAI } from "@google/genai";

let genAIInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not set. Gemini features will use standard quantitative engine.");
    }
    genAIInstance = new GoogleGenAI({
      apiKey: apiKey || "dummy_key",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIInstance;
}
