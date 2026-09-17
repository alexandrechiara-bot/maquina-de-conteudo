"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionState {
  error: string | null;
  success?: boolean;
  message?: string;
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  redirect("/dashboard");
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: "Não foi possível criar a conta. Tente outro e-mail." };
  }

  if (!data.session) {
    return {
      error: null,
      success: true,
      message: "Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.",
    };
  }

  redirect("/dashboard");
}

export async function requestPasswordReset(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/redefinir-senha`,
  });

  if (error) {
    return { error: "Não foi possível enviar o e-mail de recuperação." };
  }

  return { error: null, success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
