"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamName, password }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      role?: "ADMIN" | "PARTICIPANT";
      error?: string;
    };

    if (!res.ok || !data.ok) {
      setError(data.error ?? "로그인에 실패했습니다.");
      return;
    }

    startTransition(() => {
      router.replace(
        data.role === "ADMIN" ? "/admin/submissions" : "/submissions",
      );
      router.refresh();
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>2026 CSE 교류전 AI</CardTitle>
        <CardDescription>팀명과 비밀번호로 로그인하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="teamName">팀명</Label>
            <Input
              id="teamName"
              name="teamName"
              autoComplete="username"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "확인 중…" : "로그인"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
