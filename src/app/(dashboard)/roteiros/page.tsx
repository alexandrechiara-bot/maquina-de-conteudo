import { Suspense } from "react";
import { getScripts } from "./actions";
import { ScriptGenerator } from "./script-generator";
import { ScriptHistory } from "./script-history";

export default async function RoteirosPage() {
  const scripts = await getScripts();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Roteiros de Vídeo
        </h1>
        <p className="text-muted-foreground">
          Gere roteiros para Reels a partir dos templates da biblioteca de prompts.
        </p>
      </div>
      <Suspense>
        <ScriptGenerator />
      </Suspense>
      {scripts.length > 0 && <ScriptHistory scripts={scripts} />}
    </div>
  );
}
