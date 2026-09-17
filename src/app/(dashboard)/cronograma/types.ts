export const WEEKDAYS = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
] as const;

export const POST_TYPES = ["Reel", "Carrossel", "Card", "Story"] as const;

export type PostType = (typeof POST_TYPES)[number];

export interface ScheduleDay {
  day: (typeof WEEKDAYS)[number];
  post_type: PostType | "Descanso";
  theme: string;
}

export interface WeeklySchedule {
  id: string;
  niche: string;
  weekly_goal: string | null;
  schedule_content: ScheduleDay[];
  created_at: string;
}
