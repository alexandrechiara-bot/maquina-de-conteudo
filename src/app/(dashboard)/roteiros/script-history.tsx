"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteScript } from "./actions";
import { SCRIPT_TEMPLATES, type SavedScript } from "./types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TEMPLATE_LABELS = Object.fromEntries(
  SCRIPT_TEMPLATES.map((t) => [t.id, t.label])
);

export function ScriptHistory({ scripts }: { scripts: SavedScript[] }) {
  const [isDeleting, startDeleting] = useTransition();

  function handleDelete(id: string) {
    startDeleting(async () => {
      const result = await deleteScript(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Roteiro removido.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">Roteiros salvos</h2>
      {scripts.map((script) => (
        <Card key={script.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {script.script_content.title}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                · {TEMPLATE_LABELS[script.prompt_template] ?? script.prompt_template}
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              onClick={() => handleDelete(script.id)}
            >
              Remover
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-sm">
              <Badge variant="default">Hook</Badge>{" "}
              <span className="text-muted-foreground">{script.script_content.hook}</span>
            </p>
            <p className="text-sm">
              <Badge variant="secondary">CTA</Badge>{" "}
              <span className="text-muted-foreground">{script.script_content.cta}</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
