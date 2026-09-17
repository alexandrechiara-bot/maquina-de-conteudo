"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface BrandKit {
  handle: string | null;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  accent_color: string;
  logo_url: string | null;
}

export interface ProfileActionState {
  error: string | null;
  success?: boolean;
}

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export async function getBrandKit(): Promise<BrandKit | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select(
      "handle, primary_color, secondary_color, background_color, accent_color, logo_url"
    )
    .eq("id", user.id)
    .single();

  return data;
}

export async function updateBrandKit(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const handle = String(formData.get("handle") ?? "").trim();
  const primaryColor = String(formData.get("primary_color") ?? "");
  const secondaryColor = String(formData.get("secondary_color") ?? "");
  const backgroundColor = String(formData.get("background_color") ?? "");
  const accentColor = String(formData.get("accent_color") ?? "");

  for (const color of [primaryColor, secondaryColor, backgroundColor, accentColor]) {
    if (!HEX_COLOR_REGEX.test(color)) {
      return { error: "Cores inválidas. Use o seletor de cor." };
    }
  }

  const updates: Record<string, unknown> = {
    handle: handle || null,
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    background_color: backgroundColor,
    accent_color: accentColor,
    updated_at: new Date().toISOString(),
  };

  const logoFile = formData.get("logo") as File | null;

  if (logoFile && logoFile.size > 0) {
    if (logoFile.type !== "image/png") {
      return { error: "O logotipo deve ser um arquivo PNG." };
    }

    if (logoFile.size > 2 * 1024 * 1024) {
      return { error: "O logotipo deve ter no máximo 2MB." };
    }

    const filePath = `${user.id}/logo.png`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(filePath, logoFile, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      return { error: "Não foi possível enviar o logotipo." };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(filePath);

    updates.logo_url = `${publicUrl}?v=${Date.now()}`;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return { error: "Não foi possível salvar o Brand Kit." };
  }

  revalidatePath("/perfil");

  return { error: null, success: true };
}
