import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { BrandKitProvider } from "@/components/dashboard/brand-kit-provider";
import { getBrandKit } from "@/app/(dashboard)/perfil/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const brandKit = await getBrandKit();

  return (
    <BrandKitProvider brandKit={brandKit}>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-1 flex-col">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <SidebarTrigger />
          </div>
          <div className="flex-1 p-6">{children}</div>
        </main>
      </SidebarProvider>
    </BrandKitProvider>
  );
}
