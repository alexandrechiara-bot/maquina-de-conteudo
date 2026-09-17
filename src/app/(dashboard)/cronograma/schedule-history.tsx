"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteWeeklySchedule } from "./actions";
import type { WeeklySchedule } from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ScheduleHistory({
  schedules,
}: {
  schedules: WeeklySchedule[];
}) {
  const [isDeleting, startDeleting] = useTransition();

  function handleDelete(id: string) {
    startDeleting(async () => {
      const result = await deleteWeeklySchedule(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Cronograma removido.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">Cronogramas salvos</h2>
      {schedules.map((schedule) => (
        <Card key={schedule.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {schedule.niche}
              {schedule.weekly_goal && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  · {schedule.weekly_goal}
                </span>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              onClick={() => handleDelete(schedule.id)}
            >
              Remover
            </Button>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {schedule.schedule_content.map((day) => (
              <Badge key={day.day} variant="outline">
                {day.day}: {day.post_type}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
