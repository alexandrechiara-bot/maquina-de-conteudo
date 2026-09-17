import { getWeeklySchedules } from "./actions";
import { ScheduleGenerator } from "./schedule-generator";
import { ScheduleHistory } from "./schedule-history";

export default async function CronogramaPage() {
  const schedules = await getWeeklySchedules();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Cronograma Semanal
        </h1>
        <p className="text-muted-foreground">
          Gere e organize sua semana de conteúdo em um clique.
        </p>
      </div>
      <ScheduleGenerator />
      {schedules.length > 0 && <ScheduleHistory schedules={schedules} />}
    </div>
  );
}
