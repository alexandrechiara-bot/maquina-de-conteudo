export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            ViralCraft Studio
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Planeje e produza seu conteúdo em minutos.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
