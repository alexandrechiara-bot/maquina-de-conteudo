import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Haiku para tarefas simples/baratas (cronograma, cards curtos)
// Sonnet para tarefas que exigem mais qualidade (roteiros, carrosséis longos)
export const CLAUDE_MODELS = {
  fast: "claude-haiku-4-5-20251001",
  quality: "claude-sonnet-5",
} as const;
