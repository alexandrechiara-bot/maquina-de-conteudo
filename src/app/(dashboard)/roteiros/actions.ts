"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { gemini, GEMINI_MODELS } from "@/lib/gemini";
import { loadPromptTemplate, type PromptTemplateId } from "@/lib/prompts";
import { SCRIPT_TEMPLATES, type ScriptContent, type SavedScript } from "./types";

export interface ScriptActionState {
  error: string | null;
  success?: boolean;
  script?: ScriptContent;
  template?: string;
  topic?: string;
  niche?: string;
  tone?: string;
  duration?: string;
}

const VALID_TEMPLATE_IDS = new Set<string>(SCRIPT_TEMPLATES.map((t) => t.id));

function isValidScriptContent(value: unknown): value is ScriptContent {
  if (typeof value !== "object" || value === null) return false;
  const script = value as Record<string, unknown>;

  return (
    typeof script.title === "string" &&
    typeof script.hook === "string" &&
    typeof script.cta === "string" &&
    Array.isArray(script.body) &&
    script.body.length > 0 &&
    script.body.every(
      (step) =>
        typeof step === "object" &&
        step !== null &&
        typeof (step as Record<string, unknown>).fala === "string" &&
        typeof (step as Record<string, unknown>).corte === "string"
    )
  );
}

function parseScriptResponse(text: string): ScriptContent {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Resposta da IA não contém JSON válido.");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (!isValidScriptContent(parsed)) {
    throw new Error("Roteiro gerado é inválido.");
  }

  return parsed;
}

function buildScriptPrompt(
  systemPrompt: string,
  topic: string,
  niche: string,
  tone: string
) {
  return `${systemPrompt}

Tema do vídeo: ${topic}
Nicho: ${niche}
Tom de voz desejado: ${tone}`;
}

export async function generateScript(
  _prevState: ScriptActionState,
  formData: FormData
): Promise<ScriptActionState> {
  const template = String(formData.get("template") ?? "");
  const topic = String(formData.get("topic") ?? "").trim();
  const niche = String(formData.get("niche") ?? "").trim();
  const tone = String(formData.get("tone") ?? "").trim();

  if (!VALID_TEMPLATE_IDS.has(template)) {
    return { error: "Selecione um tipo de roteiro." };
  }

  if (!topic) {
    return { error: "Informe o tema do vídeo." };
  }

  if (!niche) {
    return { error: "Informe o nicho." };
  }

  if (!tone) {
    return { error: "Informe o tom de voz." };
  }

  const promptTemplate = loadPromptTemplate(template as PromptTemplateId);
  const duration = `${promptTemplate.frontmatter.duracao_min}-${promptTemplate.frontmatter.duracao_max}s`;

  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await gemini.models.generateContent({
        model: GEMINI_MODELS.fast,
        contents: buildScriptPrompt(promptTemplate.systemPrompt, topic, niche, tone),
      });

      const text = response.text;
      if (!text) {
        return { error: "A IA não retornou um roteiro válido." };
      }

      const script = parseScriptResponse(text);

      return { error: null, success: true, script, template, topic, niche, tone, duration };
    } catch (err) {
      const isLastAttempt = attempt === MAX_ATTEMPTS;
      const isOverloaded =
        err instanceof Error && /503|UNAVAILABLE|overloaded/i.test(err.message);
      const isRateLimited =
        err instanceof Error && /429|RESOURCE_EXHAUSTED/i.test(err.message);

      console.error(`[generateScript] tentativa ${attempt} falhou:`, err);

      if (isLastAttempt || (!isOverloaded && !isRateLimited)) {
        return {
          error: isRateLimited
            ? "Limite de uso da IA atingido no momento. Aguarde um instante e tente novamente."
            : isOverloaded
              ? "A IA está sobrecarregada no momento. Tente novamente em instantes."
              : "Não foi possível gerar o roteiro. Tente novamente.",
        };
      }

      const delay = isRateLimited ? attempt * 5000 : attempt * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { error: "Não foi possível gerar o roteiro. Tente novamente." };
}

export async function saveScript(
  template: string,
  topic: string,
  niche: string,
  tone: string,
  duration: string,
  script: ScriptContent
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase.from("scripts").insert({
    user_id: user.id,
    prompt_template: template,
    topic,
    niche,
    tone,
    duration,
    script_content: script,
  });

  if (error) {
    return { error: "Não foi possível salvar o roteiro." };
  }

  revalidatePath("/roteiros");

  return { error: null };
}

export async function getScripts(): Promise<SavedScript[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("scripts")
    .select("id, prompt_template, topic, niche, tone, duration, script_content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getScripts] falhou:", error);
    throw new Error("Não foi possível carregar os roteiros salvos.");
  }

  return data ?? [];
}

export async function deleteScript(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase
    .from("scripts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[deleteScript] falhou:", error);
    return { error: "Não foi possível remover o roteiro." };
  }

  revalidatePath("/roteiros");
  return { error: null };
}
