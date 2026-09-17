import { GoogleGenAI } from "@google/genai";

export const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// gemini-flash-latest: rápido e barato, adequado para cronogramas e cards curtos
export const GEMINI_MODELS = {
  fast: "gemini-flash-latest",
} as const;
