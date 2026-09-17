import { getBrandKit } from "./actions";
import { BrandKitForm } from "./brand-kit-form";

export default async function PerfilPage() {
  const brandKit = await getBrandKit();

  if (!brandKit) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Brand Kit</h1>
        <p className="text-muted-foreground">
          Não foi possível carregar seu perfil.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Brand Kit</h1>
        <p className="text-muted-foreground">
          Defina sua identidade visual para os conteúdos gerados.
        </p>
      </div>
      <BrandKitForm brandKit={brandKit} />
    </div>
  );
}
