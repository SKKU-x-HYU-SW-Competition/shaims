"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Eye, FileCode, Home, Trophy, Users } from "lucide-react";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./LogoutButton";

type MenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
};

const MENU: MenuItem[] = [
  { href: "/", label: "홈", icon: Home, roles: ["ADMIN", "PARTICIPANT"] },
  { href: "/submissions", label: "코드 제출", icon: FileCode, roles: ["PARTICIPANT"] },
  { href: "/brackets", label: "대진", icon: Trophy, roles: ["PARTICIPANT"] },
  { href: "/admin/submissions", label: "제출 관리", icon: FileCode, roles: ["ADMIN"] },
  { href: "/admin/brackets", label: "대진 관리", icon: Trophy, roles: ["ADMIN"] },
  { href: "/brackets", label: "대진 (참가자 뷰)", icon: Eye, roles: ["ADMIN"] },
  { href: "/admin/teams", label: "팀 관리", icon: Users, roles: ["ADMIN"] },
  { href: "/guide", label: "가이드", icon: BookOpen, roles: ["ADMIN", "PARTICIPANT"] },
];

type Props = {
  role: Role;
  teamName: string;
};

export function Sidebar({ role, teamName }: Props) {
  const pathname = usePathname();
  const items = MENU.filter((m) => m.roles.includes(role));

  return (
    <aside className="w-60 shrink-0 border-r bg-white flex flex-col sticky top-0 h-screen">
      <div className="px-5 py-5 border-b">
        <p className="text-xs font-medium text-zinc-500">2026 CSE 교류전</p>
        <p className="text-base font-semibold text-zinc-900">AI 대회</p>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700 hover:bg-zinc-100",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t px-3 py-3 space-y-2">
        <div className="px-2">
          <p className="text-xs text-zinc-500">
            {role === "ADMIN" ? "관리자" : "참가자"}
          </p>
          <p className="text-sm font-medium text-zinc-900 truncate">{teamName}</p>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
