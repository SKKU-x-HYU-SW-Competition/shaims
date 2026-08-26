"use client";

import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGuide = pathname === "/guide" || pathname.startsWith("/guide/");
  if (isGuide) {
    return <>{children}</>;
  }
  return <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>;
}
