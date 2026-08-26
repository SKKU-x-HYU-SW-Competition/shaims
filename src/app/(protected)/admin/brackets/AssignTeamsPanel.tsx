"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Team = { id: string; teamName: string };
type Group = { id: string; name: string };

export function AssignTeamsPanel({
  unassigned,
  groups,
}: {
  unassigned: Team[];
  groups: Group[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function onAssign(userId: string, groupId: string) {
    if (!groupId) return;
    setBusyId(userId);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId }),
    });
    setBusyId(null);
    if (!res.ok) {
      alert("배정에 실패했습니다.");
      return;
    }
    startTransition(() => router.refresh());
  }

  if (unassigned.length === 0) {
    return (
      <p className="text-sm text-zinc-500 py-4 text-center">
        조에 배정되지 않은 참가팀이 없습니다.
      </p>
    );
  }

  if (groups.length === 0) {
    return (
      <p className="text-sm text-zinc-500 py-4 text-center">
        조를 먼저 생성해주세요.
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {unassigned.map((t) => (
        <li key={t.id} className="flex items-center gap-2 py-2">
          <span className="flex-1 text-sm">{t.teamName}</span>
          <select
            defaultValue=""
            onChange={(e) => onAssign(t.id, e.target.value)}
            disabled={busyId === t.id}
            className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
          >
            <option value="" disabled>
              조 선택
            </option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </li>
      ))}
    </ul>
  );
}
