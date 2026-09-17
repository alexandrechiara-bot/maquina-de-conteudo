"use client";

import { useActionState, useState } from "react";
import {
  updateBrandKit,
  type BrandKit,
  type ProfileActionState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const initialState: ProfileActionState = { error: null };

const COLOR_FIELDS: {
  name: keyof Pick<
    BrandKit,
    "primary_color" | "secondary_color" | "background_color" | "accent_color"
  >;
  label: string;
}[] = [
  { name: "primary_color", label: "Cor primária" },
  { name: "secondary_color", label: "Cor secundária" },
  { name: "background_color", label: "Cor de fundo" },
  { name: "accent_color", label: "Cor de destaque" },
];

export function BrandKitForm({ brandKit }: { brandKit: BrandKit }) {
  const [state, formAction, isPending] = useActionState(
    updateBrandKit,
    initialState
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(
    brandKit.logo_url
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Kit</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="handle">Handle</Label>
            <Input
              id="handle"
              name="handle"
              placeholder="meuperfil"
              defaultValue={brandKit.handle ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {COLOR_FIELDS.map(({ name, label }) => (
              <div key={name} className="grid gap-2">
                <Label htmlFor={name}>{label}</Label>
                <input
                  id={name}
                  name={name}
                  type="color"
                  defaultValue={brandKit[name]}
                  className="h-8 w-full cursor-pointer rounded-lg border border-input bg-transparent p-1"
                />
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="logo">Logotipo (PNG, fundo transparente)</Label>
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                {logoPreview && <AvatarImage src={logoPreview} alt="Logo" />}
                <AvatarFallback>
                  {(brandKit.handle ?? "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/png"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setLogoPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state.success && (
            <p className="text-sm text-muted-foreground">
              Brand Kit atualizado com sucesso.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar Brand Kit"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
