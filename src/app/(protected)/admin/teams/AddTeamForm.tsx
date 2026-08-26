"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddTeamForm() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"PARTICIPANT" | "ADMIN">("PARTICIPANT");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamName, password, role }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };
    setSubmitting(false);

    if (!res.ok || !data.ok) {
      setError(data.error ?? "계정 생성에 실패했습니다.");
      return;
    }

    setTeamName("");
    setPassword("");
    setRole("PARTICIPANT");
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_140px_auto] sm:items-end">
      <div className="grid gap-1.5">
        <Label htmlFor="new-team-name">팀명</Label>
        <Input
          id="new-team-name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          disabled={submitting}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="new-team-password">비밀번호</Label>
        <Input
          id="new-team-password"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={4}
          disabled={submitting}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="new-team-role">권한</Label>
        <select
          id="new-team-role"
          value={role}
          onChange={(e) => setRole(e.target.value as "PARTICIPANT" | "ADMIN")}
          disabled={submitting}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="PARTICIPANT">참가자</option>
          <option value="ADMIN">관리자</option>
        </select>
      </div>
      <Button type="submit" disabled={submitting || !teamName || !password}>
        <UserPlus className="size-4" />
        추가
      </Button>
      {error && (
        <p className="text-sm text-red-600 sm:col-span-4" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
