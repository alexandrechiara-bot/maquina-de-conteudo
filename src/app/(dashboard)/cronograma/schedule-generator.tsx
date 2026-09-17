"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  generateWeeklySchedule,
  saveWeeklySchedule,
  type ScheduleActionState,
} from "./actions";
import type { ScheduleDay } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: ScheduleActionState = { error: null };

const WEEKLY_GOALS = ["Vendas", "Autoridade", "Engajamento"];

const POST_TYPE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  Reel: "default",
  Carrossel: "secondary",
  Card: "outline",
  Story: "outline",
  Descanso: "outline",
};

function scheduleToCsv(schedule: ScheduleDay[]): string {
  const header = "Dia,Tipo de Post,Tema";
  const rows = schedule.map(
    (day) => `${day.day},${day.post_type},"${day.theme.replace(/"/g, '""')}"`
  );
  return [header, ...rows].join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ScheduleGenerator() {
  const [state, formAction, isPending] = useActionState(
    generateWeeklySchedule,
    initialState
  );
  const [isSaving, startSaving] = useTransition();
  const [niche, setNiche] = useState("");
  const [weeklyGoal, setWeeklyGoal] = useState("");

  const schedule = state.schedule;

  function handleSave() {
    if (!schedule) return;

    startSaving(async () => {
      const result = await saveWeeklySchedule(niche, weeklyGoal, schedule);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Cronograma salvo com sucesso.");
      }
    });
  }

  function handleCopy() {
    if (!schedule) return;
    const text = schedule
      .map((day) => `${day.day}: ${day.post_type}${day.theme ? ` — ${day.theme}` : ""}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Cronograma copiado.");
  }

  async function handleExportPdf() {
    if (!schedule) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Cronograma Semanal", 14, 18);
    doc.setFontSize(11);

    let y = 30;
    for (const day of schedule) {
      doc.text(
        `${day.day}: ${day.post_type}${day.theme ? ` — ${day.theme}` : ""}`,
        14,
        y
      );
      y += 8;
    }

    doc.save("cronograma-semanal.pdf");
  }

  function handleExportCsv() {
    if (!schedule) return;
    downloadFile(scheduleToCsv(schedule), "cronograma-semanal.csv", "text/csv");
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerar Cronograma da Semana</CardTitle>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="niche">Nicho</Label>
              <Input
                id="niche"
                name="niche"
                placeholder="Ex: menopausa e bem-estar"
                value={niche}
                onChange={(event) => setNiche(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weekly_goal">Objetivo da semana</Label>
              <Select
                value={weeklyGoal}
                onValueChange={(value) => setWeeklyGoal(value ?? "")}
              >
                <SelectTrigger id="weekly_goal" className="w-44">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {WEEKLY_GOALS.map((goal) => (
                    <SelectItem key={goal} value={goal}>
                      {goal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="weekly_goal" value={weeklyGoal} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequência (dias/semana)</Label>
              <Input
                id="frequency"
                name="frequency"
                type="number"
                min={1}
                max={7}
                defaultValue={5}
                className="w-24"
                required
              />
            </div>
          </CardContent>
          {state.error && (
            <CardContent className="pt-0">
              <p className="text-sm text-destructive">{state.error}</p>
            </CardContent>
          )}
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Gerando..." : "Gerar Cronograma da Semana"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {schedule && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sua semana</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                Copiar
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCsv}>
                Exportar CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPdf}>
                Exportar PDF
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar cronograma"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {schedule.map((day) => (
              <Card key={day.day} className="gap-2">
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm">{day.day}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Badge variant={POST_TYPE_VARIANT[day.post_type] ?? "outline"}>
                    {day.post_type}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {day.theme || "—"}
                  </p>
                  {day.post_type !== "Descanso" && (
                    <Link
                      href={
                        day.post_type === "Reel"
                          ? `/roteiros?tema=${encodeURIComponent(day.theme)}`
                          : `/carrosseis?tema=${encodeURIComponent(day.theme)}`
                      }
                      className="text-xs font-medium text-foreground underline underline-offset-2"
                    >
                      Gerar deste item
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
