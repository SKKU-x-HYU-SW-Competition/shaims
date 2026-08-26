"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setBusy(true);
    const res = await fetch("/api/admin/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "생성에 실패했습니다.");
      return;
    }
    setName("");
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
      <div className="grid gap-1.5 flex-1 min-w-40">
        <label className="text-sm font-medium" htmlFor="new-group-name">
          조 이름
        </label>
        <Input
          id="new-group-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="A"
          maxLength={32}
          disabled={busy}
        />
      </div>
      <Button type="submit" disabled={busy || !name.trim()}>
        <Plus className="size-4" />조 추가
      </Button>
      {error && (
        <p className="w-full text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
