export const SCRIPT_TEMPLATES = [
  { id: "reels-educacional", label: "Reel Educacional" },
  { id: "reels-mito", label: "Reel Desmonta Mito" },
] as const;

export type ScriptTemplateId = (typeof SCRIPT_TEMPLATES)[number]["id"];

export const TONE_OPTIONS = [
  "Acolhedor e direto",
  "Empático e educativo",
  "Confiante e autoridade",
  "Descontraído e leve",
  "Direto e sem rodeios",
  "Inspirador e motivacional",
] as const;

export interface ScriptStep {
  fala: string;
  corte: string;
}

export interface ScriptContent {
  title: string;
  hook: string;
  body: ScriptStep[];
  cta: string;
}

export interface SavedScript {
  id: string;
  prompt_template: string;
  topic: string;
  niche: string | null;
  tone: string | null;
  duration: string | null;
  script_content: ScriptContent;
  created_at: string;
}
