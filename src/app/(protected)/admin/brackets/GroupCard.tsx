"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCcw, Trash2, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Team = { id: string; teamName: string };
type Match = {
  id: string;
  homeUserId: string;
  awayUserId: string;
  homeScore: number | null;
  awayScore: number | null;
  homeUser: { teamName: string };
  awayUser: { teamName: string };
};
type Group = {
  id: string;
  name: string;
  users: Team[];
  matches: Match[];
};

export function GroupCard({ group }: { group: Group }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function onGenerate() {
    if (group.users.length < 2) {
      alert("최소 2팀 이상 배정한 뒤 생성하세요.");
      return;
    }
    if (
      group.matches.length > 0 &&
      !confirm("기존 매치 및 점수가 모두 삭제됩니다. 재생성할까요?")
    ) {
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/groups/${group.id}/generate`, {
      method: "POST",
    });
    setBusy(false);
    if (!res.ok) {
      alert("매치 생성에 실패했습니다.");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function onDelete() {
    if (!confirm(`조 "${group.name}" 을(를) 삭제할까요?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/groups/${group.id}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) {
      alert("삭제에 실패했습니다.");
      return;
    }
    startTransition(() => router.refresh());
  }

  async function onUnassign(userId: string) {
    setBusy(true);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: null }),
    });
    setBusy(false);
    if (!res.ok) {
      alert("해제에 실패했습니다.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle>조 {group.name}</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerate}
            disabled={busy}
          >
            <RefreshCcw className="size-4" />
            매치 {group.matches.length > 0 ? "재생성" : "생성"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={busy}
            aria-label="조 삭제"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-2">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            소속 팀 ({group.users.length})
          </h4>
          {group.users.length === 0 ? (
            <p className="text-sm text-zinc-500">아직 팀이 배정되지 않았습니다.</p>
          ) : (
            <ul className="grid gap-1 sm:grid-cols-2">
              {group.users.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
                >
                  <span>{t.teamName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUnassign(t.id)}
                    disabled={busy}
                    aria-label="해제"
                  >
                    <X className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-2">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            매치 ({group.matches.length})
          </h4>
          {group.matches.length === 0 ? (
            <p className="text-sm text-zinc-500">
              팀 배정 후 &quot;매치 생성&quot; 으로 1바퀴 라운드로빈을 만들거나,
              아래에서 매치를 하나씩 추가할 수 있습니다.
            </p>
          ) : (
            <ul className="space-y-1">
              {group.matches.map((m) => (
                <MatchRow key={m.id} match={m} disabled={busy} />
              ))}
            </ul>
          )}
          {group.users.length >= 2 && (
            <AddMatchForm groupId={group.id} teams={group.users} />
          )}
        </section>
      </CardContent>
    </Card>
  );
}

function MatchRow({ match, disabled }: { match: Match; disabled: boolean }) {
  const router = useRouter();
  const [home, setHome] = useState<string>(match.homeScore?.toString() ?? "");
  const [away, setAway] = useState<string>(match.awayScore?.toString() ?? "");
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function save() {
    const h = home === "" ? null : Number(home);
    const a = away === "" ? null : Number(away);
    if (h !== null && (Number.isNaN(h) || h < 0)) return alert("점수 오류");
    if (a !== null && (Number.isNaN(a) || a < 0)) return alert("점수 오류");
    if (h !== null && a !== null && h === a) {
      alert("무승부는 허용되지 않습니다.");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/group-matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeScore: h, awayScore: a }),
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
    if (
      !confirm(
        `"${match.homeUser.teamName} vs ${match.awayUser.teamName}" 매치를 삭제할까요?`,
      )
    )
      return;
    setBusy(true);
    const res = await fetch(`/api/admin/group-matches/${match.id}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) {
      alert("삭제에 실패했습니다.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <li className="grid grid-cols-[1fr_auto_1fr_auto_auto] items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
      <span className="text-right pr-1">{match.homeUser.teamName}</span>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={0}
          value={home}
          onChange={(e) => setHome(e.target.value)}
          disabled={disabled || busy}
          className="h-8 w-14 text-center"
        />
        <span className="text-zinc-400">:</span>
        <Input
          type="number"
          min={0}
          value={away}
          onChange={(e) => setAway(e.target.value)}
          disabled={disabled || busy}
          className="h-8 w-14 text-center"
        />
      </div>
      <span className="pl-1">{match.awayUser.teamName}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={save}
        disabled={disabled || busy}
      >
        저장
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={remove}
        disabled={disabled || busy}
        aria-label="매치 삭제"
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}

function AddMatchForm({
  groupId,
  teams,
}: {
  groupId: string;
  teams: Team[];
}) {
  const router = useRouter();
  const [homeId, setHomeId] = useState("");
  const [awayId, setAwayId] = useState("");
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!homeId || !awayId) return;
    if (homeId === awayId) {
      alert("같은 팀끼리 배정할 수 없습니다.");
      return;
    }
    const h = home === "" ? null : Number(home);
    const a = away === "" ? null : Number(away);
    if (h !== null && a !== null && h === a) {
      alert("무승부는 허용되지 않습니다.");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/groups/${groupId}/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeUserId: homeId,
        awayUserId: awayId,
        homeScore: h,
        awayScore: a,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      alert(data.error ?? "추가 실패");
      return;
    }
    setHomeId("");
    setAwayId("");
    setHome("");
    setAway("");
    startTransition(() => router.refresh());
  }

  return (
    <form
      onSubmit={onAdd}
      className="mt-2 grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm"
    >
      <select
        value={homeId}
        onChange={(e) => setHomeId(e.target.value)}
        disabled={busy}
        className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
        aria-label="홈 팀"
      >
        <option value="">홈 팀</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.teamName}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={0}
          value={home}
          onChange={(e) => setHome(e.target.value)}
          disabled={busy}
          className="h-8 w-14 text-center"
          placeholder="-"
        />
        <span className="text-zinc-400">:</span>
        <Input
          type="number"
          min={0}
          value={away}
          onChange={(e) => setAway(e.target.value)}
          disabled={busy}
          className="h-8 w-14 text-center"
          placeholder="-"
        />
      </div>
      <select
        value={awayId}
        onChange={(e) => setAwayId(e.target.value)}
        disabled={busy}
        className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
        aria-label="원정 팀"
      >
        <option value="">원정 팀</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.teamName}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={busy || !homeId || !awayId}>
        <Plus className="size-4" />
        추가
      </Button>
    </form>
  );
}
