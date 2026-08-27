"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Link = {
  id: string;
  label: string;
  url: string;
  description: string | null;
  order: number;
};

export function LinksEditor({ links }: { links: Link[] }) {
  return (
    <div className="space-y-3">
      <AddLinkForm />
      {links.length === 0 ? (
        <p className="text-sm text-zinc-500 py-6 text-center rounded-md border border-dashed">
          등록된 링크가 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {links.map((l) => (
            <li key={l.id}>
              <LinkRow link={l} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddLinkForm() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await fetch("/api/admin/home/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        url,
        description: description || null,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "추가 실패");
      return;
    }
    setLabel("");
    setUrl("");
    setDescription("");
    startTransition(() => router.refresh());
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-dashed p-3 space-y-2"
    >
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
        새 링크 추가
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label htmlFor="new-link-label">이름</Label>
          <Input
            id="new-link-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            maxLength={80}
            disabled={busy}
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="new-link-url">URL</Label>
          <Input
            id="new-link-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://..."
            maxLength={500}
            disabled={busy}
          />
        </div>
      </div>
      <div className="grid gap-1">
        <Label htmlFor="new-link-desc">설명 (선택)</Label>
        <Input
          id="new-link-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
          disabled={busy}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <Button
        type="submit"
        size="sm"
        disabled={busy || !label.trim() || !url.trim()}
      >
        <Plus className="size-4" />추가
      </Button>
    </form>
  );
}

function LinkRow({ link }: { link: Link }) {
  const router = useRouter();
  const [label, setLabel] = useState(link.label);
  const [url, setUrl] = useState(link.url);
  const [description, setDescription] = useState(link.description ?? "");
  const [order, setOrder] = useState(link.order.toString());
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  const dirty =
    label !== link.label ||
    url !== link.url ||
    description !== (link.description ?? "") ||
    order !== link.order.toString();

  async function save() {
    setBusy(true);
    const res = await fetch(`/api/admin/home/links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        url,
        description: description || null,
        order: Number(order) || 0,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      alert(data.error ?? "저장 실패");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function remove() {
    if (!confirm(`링크 "${link.label}" 을(를) 삭제할까요?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/home/links/${link.id}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) {
      alert("삭제 실패");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="rounded-md border p-3 space-y-2 bg-white">
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_80px]">
        <div className="grid gap-1">
          <Label htmlFor={`label-${link.id}`} className="text-xs">
            이름
          </Label>
          <Input
            id={`label-${link.id}`}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor={`url-${link.id}`} className="text-xs">
            URL
          </Label>
          <Input
            id={`url-${link.id}`}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor={`order-${link.id}`} className="text-xs">
            순서
          </Label>
          <Input
            id={`order-${link.id}`}
            type="number"
            min={0}
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            disabled={busy}
          />
        </div>
      </div>
      <div className="grid gap-1">
        <Label htmlFor={`desc-${link.id}`} className="text-xs">
          설명
        </Label>
        <Input
          id={`desc-${link.id}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={busy}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={remove}
          disabled={busy}
          aria-label="삭제"
        >
          <Trash2 className="size-4" />
        </Button>
        <Button
          variant={dirty ? "default" : "outline"}
          size="sm"
          onClick={save}
          disabled={busy || !dirty || !label.trim() || !url.trim()}
        >
          <Save className="size-4" />저장
        </Button>
      </div>
    </div>
  );
}
