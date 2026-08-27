"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContentEditor({
  initialTitle,
  initialSubtitle,
}: {
  initialTitle: string;
  initialSubtitle: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [, startTransition] = useTransition();

  const dirty = title !== initialTitle || subtitle !== initialSubtitle;

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(false);
    setBusy(true);
    const res = await fetch("/api/admin/home", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "저장 실패");
      return;
    }
    setOk(true);
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={save} className="grid gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="home-title">제목</Label>
        <Input
          id="home-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          disabled={busy}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="home-subtitle">소개 문구</Label>
        <textarea
          id="home-subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          rows={4}
          maxLength={1000}
          disabled={busy}
          className="min-h-[96px] rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-y"
          placeholder="줄바꿈은 그대로 반영됩니다."
        />
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {ok && !dirty && (
        <p className="text-sm text-emerald-600">저장되었습니다.</p>
      )}
      <Button
        type="submit"
        disabled={busy || !dirty || !title.trim()}
        className="justify-self-start"
      >
        <Save className="size-4" />저장
      </Button>
    </form>
  );
}
