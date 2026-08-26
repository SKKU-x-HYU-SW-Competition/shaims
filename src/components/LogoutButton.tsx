"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    startTransition(() => {
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onLogout}
      disabled={pending}
      className="w-full justify-start gap-2"
    >
      <LogOut className="size-4" />
      로그아웃
    </Button>
  );
}
