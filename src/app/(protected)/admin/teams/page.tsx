import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
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
import { AddTeamForm } from "./AddTeamForm";
import { TeamRowActions } from "./TeamRowActions";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  const admin = await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { teamName: "asc" }],
    select: {
      id: true,
      teamName: true,
      role: true,
      createdAt: true,
      _count: { select: { submissions: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">팀 관리</h1>
        <p className="text-sm text-zinc-600">
          참가팀과 관리자 계정을 관리합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>계정 추가</CardTitle>
          <CardDescription>
            팀명은 로그인 아이디로 사용됩니다. 비밀번호는 평문으로 입력하며 저장 시 해싱됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddTeamForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>전체 계정</CardTitle>
          <CardDescription>총 {users.length}개.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>팀명</TableHead>
                <TableHead className="w-24">권한</TableHead>
                <TableHead className="w-24 text-right">제출 수</TableHead>
                <TableHead className="w-40">생성일</TableHead>
                <TableHead className="w-32 text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.teamName}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                      {u.role === "ADMIN" ? "관리자" : "참가자"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {u._count.submissions}
                  </TableCell>
                  <TableCell className="text-zinc-600 tabular-nums">
                    {u.createdAt.toLocaleString("ko-KR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <TeamRowActions
                      id={u.id}
                      teamName={u.teamName}
                      isSelf={u.id === admin.userId}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
