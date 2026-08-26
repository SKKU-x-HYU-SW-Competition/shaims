import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteSubmissionButton } from "@/components/DeleteSubmissionButton";
import { formatBytes } from "@/lib/submissions";

export const dynamic = "force-dynamic";

type Submission = {
  id: string;
  fileName: string;
  fileSize: number;
  language: string;
  createdAt: Date;
};
type Team = { id: string; teamName: string; submissions: Submission[] };
type Section = { key: string; label: string; teams: Team[] };

export default async function AdminSubmissionsPage() {
  const participants = await prisma.user.findMany({
    where: { role: "PARTICIPANT" },
    orderBy: { teamName: "asc" },
    select: {
      id: true,
      teamName: true,
      groupId: true,
      group: { select: { id: true, name: true, order: true } },
      submissions: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fileName: true,
          fileSize: true,
          language: true,
          createdAt: true,
        },
      },
    },
  });

  const byGroup = new Map<
    string,
    { order: number; name: string; teams: Team[] }
  >();
  const unassigned: Team[] = [];

  for (const p of participants) {
    const team: Team = {
      id: p.id,
      teamName: p.teamName,
      submissions: p.submissions,
    };
    if (!p.group) {
      unassigned.push(team);
      continue;
    }
    const existing = byGroup.get(p.group.id);
    if (existing) {
      existing.teams.push(team);
    } else {
      byGroup.set(p.group.id, {
        order: p.group.order,
        name: p.group.name,
        teams: [team],
      });
    }
  }

  const sections: Section[] = [
    ...[...byGroup.values()]
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "ko"))
      .map((g) => ({
        key: `group-${g.name}`,
        label: `조 ${g.name} (${g.teams.length}팀)`,
        teams: g.teams,
      })),
  ];
  if (unassigned.length > 0) {
    sections.push({
      key: "unassigned",
      label: `미배정 (${unassigned.length}팀)`,
      teams: unassigned,
    });
  }

  const totalSubmissions = participants.reduce(
    (sum, p) => sum + p.submissions.length,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">제출 관리</h1>
        <p className="text-sm text-zinc-600">
          팀별 제출 내역입니다. 팀명을 클릭하면 상세가 펼쳐집니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>팀별 제출</CardTitle>
          <CardDescription>
            총 {participants.length}팀 · {totalSubmissions}건.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {sections.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">
              등록된 참가팀이 없습니다.
            </p>
          ) : (
            sections.map((section) => (
              <section key={section.key} className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  {section.label}
                </h3>
                <ul className="space-y-1.5">
                  {section.teams.map((team) => (
                    <li key={team.id}>
                      <TeamAccordion team={team} />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TeamAccordion({ team }: { team: Team }) {
  const count = team.submissions.length;
  return (
    <details className="group rounded-md border bg-white overflow-hidden">
      <summary className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-50 list-none [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-4 text-zinc-500 transition-transform group-open:rotate-90" />
        <span className="font-medium text-sm flex-1 truncate">{team.teamName}</span>
        <Badge variant={count === 0 ? "outline" : "secondary"}>{count}건</Badge>
      </summary>
      <div className="border-t">
        {count === 0 ? (
          <p className="p-6 text-sm text-zinc-500 text-center">
            제출된 파일이 없습니다.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>파일명</TableHead>
                <TableHead className="w-20">언어</TableHead>
                <TableHead className="w-24 text-right">크기</TableHead>
                <TableHead className="w-40">제출 시각</TableHead>
                <TableHead className="w-32 text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.submissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium break-all">
                    {s.fileName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">.{s.language}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBytes(s.fileSize)}
                  </TableCell>
                  <TableCell className="text-zinc-600 tabular-nums">
                    {s.createdAt.toLocaleString("ko-KR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <a
                      href={`/api/submissions/${s.id}/download`}
                      className="text-sm text-zinc-700 underline hover:text-zinc-900 mr-2"
                    >
                      다운로드
                    </a>
                    <DeleteSubmissionButton
                      id={s.id}
                      fileName={s.fileName}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </details>
  );
}
