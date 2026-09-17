"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthActionState } from "../actions";
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

const initialState: AuthActionState = { error: null };

export default function CadastroPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="voce@exemplo.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
            />
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state.success && state.message && (
            <p className="text-sm text-muted-foreground">{state.message}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Criando conta..." : "Criar conta"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
