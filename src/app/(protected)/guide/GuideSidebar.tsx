"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GUIDE_TREE } from "@/lib/guide-tree";
import { cn } from "@/lib/utils";

export function GuideSidebar() {
  const pathname = usePathname();
  return (
    <nav className="w-48 shrink-0 space-y-5 text-sm">
      {GUIDE_TREE.map((g) => (
        <div key={g.group}>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 px-2">
            {g.group}
          </p>
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const href = item.slug ? `/guide/${item.slug}` : "/guide";
              const active = pathname === href;
              return (
                <li key={item.slug || "index"}>
                  <Link
                    href={href}
                    className={cn(
                      "block rounded px-2 py-1 transition-colors",
                      active
                        ? "bg-zinc-900 text-white font-medium"
                        : "text-zinc-700 hover:bg-zinc-100",
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
