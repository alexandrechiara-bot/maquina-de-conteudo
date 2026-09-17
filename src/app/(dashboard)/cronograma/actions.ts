"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { gemini, GEMINI_MODELS } from "@/lib/gemini";
import { POST_TYPES, WEEKDAYS, type ScheduleDay, type WeeklySchedule } from "./types";

export interface ScheduleActionState {
  error: string | null;
  success?: boolean;
  schedule?: ScheduleDay[];
  niche?: string;
  weeklyGoal?: string;
}

function buildSchedulePrompt(
  niche: string,
  weeklyGoal: string,
  frequency: number
) {
  return `Você é um estrategista de conteúdo para redes sociais especializado em planejar cronogramas semanais de alta performance.

Nicho: ${niche}
Objetivo da semana: ${weeklyGoal}
Frequência: ${frequency} publicações por semana (distribua nos 7 dias, deixando os demais como "Descanso")

Distribua os tipos de post (Reel, Carrossel, Card, Story) ao longo da semana (Segunda a Domingo) de forma estratégica para atingir o objetivo informado. Varie os formatos, evite repetir o mesmo tipo em dias consecutivos quando possível.

Responda SOMENTE com um JSON no formato:
{
  "schedule": [
    { "day": "Segunda", "post_type": "Reel", "theme": "string breve descrevendo o tema do post" }
  ]
}

O array "schedule" deve ter exatamente 7 itens (um para cada dia da semana, de Segunda a Domingo). Dias sem publicação devem usar "post_type": "Descanso" e "theme": "".`;
}

const VALID_POST_TYPES = new Set<string>([...POST_TYPES, "Descanso"]);

function isValidScheduleDay(value: unknown): value is ScheduleDay {
  if (typeof value !== "object" || value === null) return false;
  const day = value as Record<string, unknown>;
  return (
    typeof day.day === "string" &&
    (WEEKDAYS as readonly string[]).includes(day.day) &&
    typeof day.post_type === "string" &&
    VALID_POST_TYPES.has(day.post_type) &&
    typeof day.theme === "string"
  );
}

function parseScheduleResponse(text: string): ScheduleDay[] {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Resposta da IA não contém JSON válido.");
  }

  const parsed = JSON.parse(jsonMatch[0]) as { schedule: unknown };

  if (
    !Array.isArray(parsed.schedule) ||
    parsed.schedule.length !== 7 ||
    !parsed.schedule.every(isValidScheduleDay)
  ) {
    throw new Error("Cronograma gerado é inválido.");
  }

  return parsed.schedule;
}

export async function generateWeeklySchedule(
  _prevState: ScheduleActionState,
  formData: FormData
): Promise<ScheduleActionState> {
  const niche = String(formData.get("niche") ?? "").trim();
  const weeklyGoal = String(formData.get("weekly_goal") ?? "").trim();
  const frequency = Number(formData.get("frequency") ?? 0);

  if (!niche) {
    return { error: "Informe o nicho." };
  }

  if (!weeklyGoal) {
    return { error: "Selecione o objetivo da semana." };
  }

  if (!frequency || frequency < 1 || frequency > 7) {
    return { error: "Frequência inválida. Escolha entre 1 e 7 dias." };
  }

  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await gemini.models.generateContent({
        model: GEMINI_MODELS.fast,
        contents: buildSchedulePrompt(niche, weeklyGoal, frequency),
      });

      const text = response.text;
      if (!text) {
        return { error: "A IA não retornou um cronograma válido." };
      }

      const schedule = parseScheduleResponse(text);

      return { error: null, success: true, schedule, niche, weeklyGoal };
    } catch (err) {
      const isLastAttempt = attempt === MAX_ATTEMPTS;
      const isOverloaded =
        err instanceof Error && /503|UNAVAILABLE|overloaded/i.test(err.message);

      console.error(`[generateWeeklySchedule] tentativa ${attempt} falhou:`, err);

      if (isLastAttempt || !isOverloaded) {
        return {
          error: isOverloaded
            ? "A IA está sobrecarregada no momento. Tente novamente em instantes."
            : "Não foi possível gerar o cronograma. Tente novamente.",
        };
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  return { error: "Não foi possível gerar o cronograma. Tente novamente." };
}

export async function saveWeeklySchedule(
  niche: string,
  weeklyGoal: string,
  schedule: ScheduleDay[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase.from("weekly_schedules").insert({
    user_id: user.id,
    niche,
    weekly_goal: weeklyGoal,
    schedule_content: schedule,
  });

  if (error) {
    return { error: "Não foi possível salvar o cronograma." };
  }

  revalidatePath("/cronograma");

  return { error: null };
}

export async function getWeeklySchedules(): Promise<WeeklySchedule[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("weekly_schedules")
    .select("id, niche, weekly_goal, schedule_content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getWeeklySchedules] falhou:", error);
    throw new Error("Não foi possível carregar os cronogramas salvos.");
  }

  return data ?? [];
}

export async function deleteWeeklySchedule(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase
    .from("weekly_schedules")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[deleteWeeklySchedule] falhou:", error);
    return { error: "Não foi possível remover o cronograma." };
  }

  revalidatePath("/cronograma");
  return { error: null };
}
