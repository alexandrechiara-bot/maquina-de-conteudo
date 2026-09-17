import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Olá, {user?.email?.split("@")[0]}
        </h1>
        <p className="text-muted-foreground">
          O que vamos criar hoje?
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Cronograma Semanal</CardTitle>
            <CardDescription>
              Gere sua grade de conteúdo da semana em 1 clique.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Roteiros de Vídeo</CardTitle>
            <CardDescription>
              Crie roteiros para Reels, TikTok e Kwai.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Carrosséis & Cards</CardTitle>
            <CardDescription>
              Monte carrosséis e cards prontos para publicar.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
