import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  MAX_UPLOAD_BYTES,
  getExtension,
  isAllowedExtension,
  sanitizeForFileName,
} from "@/lib/submissions";

export async function POST(req: Request) {
  const user = await requireUser();

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "파일을 선택해주세요." },
      { status: 400 },
    );
  }

  const ext = getExtension(file.name);
  if (!isAllowedExtension(ext)) {
    return NextResponse.json(
      { error: ".js 또는 .py 파일만 업로드할 수 있습니다." },
      { status: 400 },
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "파일 크기는 4MB 이하여야 합니다." },
      { status: 400 },
    );
  }

  const existingCount = await prisma.submission.count({
    where: { userId: user.userId },
  });
  const nextVersion = existingCount + 1;
  const displayName = `${sanitizeForFileName(user.teamName)}_v${nextVersion}.${ext}`;

  const blob = await put(`submissions/${user.userId}/${displayName}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type || "text/plain",
  });

  const submission = await prisma.submission.create({
    data: {
      userId: user.userId,
      fileName: displayName,
      fileUrl: blob.url,
      fileSize: file.size,
      language: ext,
    },
  });

  return NextResponse.json({ ok: true, submission });
}
