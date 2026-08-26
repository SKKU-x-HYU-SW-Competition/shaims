"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TeamRowActions({
  id,
  teamName,
  isSelf,
}: {
  id: string;
  teamName: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function onResetPassword() {
    const next = prompt(`"${teamName}" 의 새 비밀번호를 입력하세요.`);
    if (!next) return;
    if (next.length < 4) {
      alert("비밀번호는 4자 이상이어야 합니다.");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: next }),
    });
    setBusy(false);
    if (!res.ok) {
      alert("변경에 실패했습니다.");
      return;
    }
    alert("비밀번호를 변경했습니다.");
  }

  async function onDelete() {
    if (!confirm(`"${teamName}" 계정과 관련된 모든 데이터를 삭제할까요?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      alert(data.error ?? "삭제에 실패했습니다.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onResetPassword}
        disabled={busy}
        aria-label="비밀번호 재설정"
      >
        <KeyRound className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        disabled={busy || isSelf}
        aria-label="삭제"
        title={isSelf ? "본인 계정은 삭제할 수 없습니다" : "삭제"}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
