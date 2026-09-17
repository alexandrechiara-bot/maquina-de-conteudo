"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { generateScript, saveScript, type ScriptActionState } from "./actions";
import { SCRIPT_TEMPLATES, TONE_OPTIONS } from "./types";
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

const initialState: ScriptActionState = { error: null };

export function ScriptGenerator() {
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(
    generateScript,
    initialState
  );
  const [isSaving, startSaving] = useTransition();
  const [template, setTemplate] = useState<string>(SCRIPT_TEMPLATES[0].id);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");

  useEffect(() => {
    const tema = searchParams.get("tema");
    if (tema) {
      setTopic(tema);
    }
  }, [searchParams]);

  const script = state.script;

  function handleSave() {
    if (
      !script ||
      state.template === undefined ||
      state.topic === undefined ||
      state.niche === undefined ||
      state.tone === undefined ||
      state.duration === undefined
    ) {
      return;
    }

    startSaving(async () => {
      const result = await saveScript(
        state.template!,
        state.topic!,
        state.niche!,
        state.tone!,
        state.duration!,
        script
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Roteiro salvo com sucesso.");
      }
    });
  }

  function handleCopy() {
    if (!script) return;
    const text = [
      script.title,
      "",
      `Hook: ${script.hook}`,
      "",
      ...script.body.map((step) => `- ${step.fala} (${step.corte})`),
      "",
      `CTA: ${script.cta}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Roteiro copiado.");
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerar Roteiro de Vídeo</CardTitle>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="template">Tipo de roteiro</Label>
              <Select value={template} onValueChange={(value) => setTemplate(value ?? "")}>
                <SelectTrigger id="template" className="w-64">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {SCRIPT_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="template" value={template} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="topic">Tema do vídeo</Label>
              <Input
                id="topic"
                name="topic"
                placeholder="Ex: como aliviar ondas de calor naturalmente"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="niche">Nicho</Label>
                <Input
                  id="niche"
                  name="niche"
                  placeholder="Ex: menopausa e bem-estar"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tone">Tom de voz</Label>
                <Select value={tone} onValueChange={(value) => setTone(value ?? "")}>
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="tone" value={tone} />
              </div>
            </div>
          </CardContent>
          {state.error && (
            <CardContent className="pt-0">
              <p className="text-sm text-destructive">{state.error}</p>
            </CardContent>
          )}
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Gerando..." : "Gerar Roteiro"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {script && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{script.title}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                Copiar Roteiro
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar Roteiro"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <Badge>Hook (3s)</Badge>
              <p className="mt-1 text-sm">{script.hook}</p>
            </div>
            <div className="flex flex-col gap-2">
              {script.body.map((step, index) => (
                <div key={index} className="rounded-lg border border-border p-3">
                  <p className="text-sm">{step.fala}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Corte: {step.corte}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <Badge variant="secondary">CTA</Badge>
              <p className="mt-1 text-sm">{script.cta}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
