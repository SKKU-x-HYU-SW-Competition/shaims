import { requireUser } from "@/lib/auth";
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
import { UploadForm } from "./UploadForm";
import { DeleteSubmissionButton } from "@/components/DeleteSubmissionButton";
import { formatBytes } from "@/lib/submissions";

export const dynamic = "force-dynamic";

export default async function ParticipantSubmissionsPage() {
  const user = await requireUser();
  const submissions = await prisma.submission.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">코드 제출</h1>
        <p className="text-sm text-zinc-600">
          팀명 <span className="font-medium">{user.teamName}</span> 의 제출
          기록입니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>새 코드 업로드</CardTitle>
          <CardDescription>
            최신 제출본이 대전에 사용됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>내 제출 내역</CardTitle>
          <CardDescription>
            총 {submissions.length}건. 최신 순으로 표시됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">
              아직 제출된 파일이 없습니다.
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
                {submissions.map((s) => (
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
        </CardContent>
      </Card>
    </div>
  );
}
