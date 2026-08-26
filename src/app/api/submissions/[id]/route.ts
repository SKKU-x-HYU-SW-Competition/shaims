import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await params;

  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (submission.userId !== user.userId && user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await del(submission.fileUrl).catch(() => {
    // Blob 이미 없더라도 DB 정리는 진행
  });
  await prisma.submission.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
