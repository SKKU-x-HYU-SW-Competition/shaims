import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET(
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

  const blobRes = await fetch(submission.fileUrl);
  if (!blobRes.ok || !blobRes.body) {
    return NextResponse.json({ error: "blob fetch failed" }, { status: 502 });
  }

  const asciiFallback = submission.fileName.replace(/[^\x20-\x7E]/g, "_");
  const utf8Encoded = encodeURIComponent(submission.fileName);

  return new NextResponse(blobRes.body, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${asciiFallback}"; filename*=UTF-8''${utf8Encoded}`,
      "Cache-Control": "no-store",
    },
  });
}
