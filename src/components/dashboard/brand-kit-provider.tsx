"use client";

import { createContext, useContext } from "react";
import type { BrandKit } from "@/app/(dashboard)/perfil/actions";

const BrandKitContext = createContext<BrandKit | null>(null);

export function BrandKitProvider({
  brandKit,
  children,
}: {
  brandKit: BrandKit | null;
  children: React.ReactNode;
}) {
  return (
    <BrandKitContext.Provider value={brandKit}>
      {children}
    </BrandKitContext.Provider>
  );
}

export function useBrandKit() {
  return useContext(BrandKitContext);
}
