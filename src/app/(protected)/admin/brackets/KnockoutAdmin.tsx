"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  bracketMeta,
  gridPos,
  roundLabel,
  winnerSide,
  type KnockoutMatchData,
} from "@/lib/knockout";

type Team = { id: string; teamName: string };

export function KnockoutAdmin({
  matches,
  participants,
}: {
  matches: KnockoutMatchData[];
  participants: Team[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [initSize, setInitSize] = useState<4 | 8 | 16>(8);
  const [busy, setBusy] = useState(false);

  async function onInit() {
    if (matches.length > 0 && !confirm("기존 본선 매치를 모두 지우고 새로 만듭니다. 진행할까요?")) {
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/knockout/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ size: initSize }),
    });
    setBusy(false);
    if (!res.ok) {
      alert("초기화에 실패했습니다.");
      return;
    }
    startTransition(() => router.refresh());
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-wrap items-end gap-2 rounded-md border border-dashed p-4">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium" htmlFor="init-size">
            브래킷 크기
          </label>
          <select
            id="init-size"
            value={initSize}
            onChange={(e) => setInitSize(Number(e.target.value) as 4 | 8 | 16)}
            disabled={busy}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value={4}>4팀 (준결승 부터)</option>
            <option value={8}>8팀 (8강 부터)</option>
            <option value={16}>16팀 (16강 부터)</option>
          </select>
        </div>
        <Button onClick={onInit} disabled={busy}>
          브래킷 생성
        </Button>
      </div>
    );
  }

  const { totalRounds, size, totalRows } = bracketMeta(matches);
  const normalMatches = matches.filter((m) => !m.isThirdPlace);
  const thirdPlace = matches.find((m) => m.isThirdPlace) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-zinc-600">
          {size}팀 브래킷 · 총 {matches.length}경기 (3·4위전 포함)
        </p>
        <div className="flex items-end gap-2">
          <select
            value={initSize}
            onChange={(e) => setInitSize(Number(e.target.value) as 4 | 8 | 16)}
            disabled={busy}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value={4}>4팀</option>
            <option value={8}>8팀</option>
            <option value={16}>16팀</option>
          </select>
          <Button variant="outline" size="sm" onClick={onInit} disabled={busy}>
            브래킷 재생성
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div
          className="grid gap-x-6"
          style={{
            gridTemplateColumns: `repeat(${totalRounds}, minmax(220px, 1fr))`,
          }}
        >
          {Array.from({ length: totalRounds }, (_, i) => (
            <div
              key={`h-${i}`}
              style={{ gridColumn: i + 1 }}
              className="pb-2 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wide"
            >
              {roundLabel(i + 1, size)}
            </div>
          ))}
        </div>

        <div
          className="grid gap-x-6 gap-y-2"
          style={{
            gridTemplateColumns: `repeat(${totalRounds}, minmax(220px, 1fr))`,
            gridTemplateRows: `repeat(${totalRows}, minmax(96px, auto))`,
          }}
        >
          {normalMatches.map((m) => (
            <div
              key={m.id}
              style={gridPos(m.round, m.slot)}
              className="flex items-center"
            >
              <MatchCardAdmin match={m} participants={participants} />
            </div>
          ))}
        </div>
      </div>

      {thirdPlace && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            3·4위전
          </h4>
          <div className="max-w-xs">
            <MatchCardAdmin match={thirdPlace} participants={participants} />
          </div>
        </div>
      )}
    </div>
  );
}

function MatchCardAdmin({
  match,
  participants,
}: {
  match: KnockoutMatchData;
  participants: Team[];
}) {
  const router = useRouter();
  const [homeId, setHomeId] = useState<string>(match.homeUserId ?? "");
  const [awayId, setAwayId] = useState<string>(match.awayUserId ?? "");
  const [home, setHome] = useState<string>(match.homeScore?.toString() ?? "");
  const [away, setAway] = useState<string>(match.awayScore?.toString() ?? "");
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  const winner = winnerSide(
    home === "" ? null : Number(home),
    away === "" ? null : Number(away),
  );

  const dirty =
    homeId !== (match.homeUserId ?? "") ||
    awayId !== (match.awayUserId ?? "") ||
    home !== (match.homeScore?.toString() ?? "") ||
    away !== (match.awayScore?.toString() ?? "");

  async function save() {
    const h = home === "" ? null : Number(home);
    const a = away === "" ? null : Number(away);
    if (h !== null && Number.isNaN(h)) return alert("점수 오류");
    if (a !== null && Number.isNaN(a)) return alert("점수 오류");
    if (h !== null && a !== null && h === a) {
      alert("무승부는 허용되지 않습니다.");
      return;
    }
    if (homeId && awayId && homeId === awayId) {
      alert("같은 팀끼리 배정할 수 없습니다.");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/knockout-matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeUserId: homeId || null,
        awayUserId: awayId || null,
        homeScore: h,
        awayScore: a,
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

  async function clearMatch() {
    if (!confirm("이 매치의 팀·점수를 모두 비울까요?")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/knockout-matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeUserId: null,
        awayUserId: null,
        homeScore: null,
        awayScore: null,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      alert("비우기 실패");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="w-full rounded-md border bg-white p-2 text-sm shadow-xs">
      <div className="grid gap-1.5">
        <div className="flex items-center gap-1">
          <select
            value={homeId}
            onChange={(e) => setHomeId(e.target.value)}
            disabled={busy}
            className={cn(
              "h-8 flex-1 min-w-0 rounded-md border border-input bg-transparent px-2 text-sm",
              winner === "home" && "font-semibold",
            )}
          >
            <option value="">미정</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.teamName}
              </option>
            ))}
          </select>
          <Input
            type="number"
            min={0}
            value={home}
            onChange={(e) => setHome(e.target.value)}
            disabled={busy}
            className="h-8 w-14 text-center"
          />
        </div>
        <div className="flex items-center gap-1">
          <select
            value={awayId}
            onChange={(e) => setAwayId(e.target.value)}
            disabled={busy}
            className={cn(
              "h-8 flex-1 min-w-0 rounded-md border border-input bg-transparent px-2 text-sm",
              winner === "away" && "font-semibold",
            )}
          >
            <option value="">미정</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.teamName}
              </option>
            ))}
          </select>
          <Input
            type="number"
            min={0}
            value={away}
            onChange={(e) => setAway(e.target.value)}
            disabled={busy}
            className="h-8 w-14 text-center"
          />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearMatch}
          disabled={busy}
          aria-label="비우기"
        >
          <Trash2 className="size-4" />
        </Button>
        <Button
          variant={dirty ? "default" : "outline"}
          size="sm"
          onClick={save}
          disabled={busy || !dirty}
        >
          저장
        </Button>
      </div>
    </div>
  );
}
