import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  homeUserId: z.string().nullable().optional(),
  awayUserId: z.string().nullable().optional(),
  homeScore: z.number().int().min(0).max(9999).nullable().optional(),
  awayScore: z.number().int().min(0).max(9999).nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const patch: {
    homeUserId?: string | null;
    awayUserId?: string | null;
    homeScore?: number | null;
    awayScore?: number | null;
    playedAt?: Date | null;
  } = {};
  if (parsed.data.homeUserId !== undefined) patch.homeUserId = parsed.data.homeUserId || null;
  if (parsed.data.awayUserId !== undefined) patch.awayUserId = parsed.data.awayUserId || null;
  if (parsed.data.homeScore !== undefined) patch.homeScore = parsed.data.homeScore;
  if (parsed.data.awayScore !== undefined) patch.awayScore = parsed.data.awayScore;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "변경할 값이 없습니다." }, { status: 400 });
  }

  if (
    patch.homeUserId &&
    patch.awayUserId &&
    patch.homeUserId === patch.awayUserId
  ) {
    return NextResponse.json({ error: "같은 팀끼리 배정할 수 없습니다." }, { status: 400 });
  }

  const current = await prisma.knockoutMatch.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "not found" }, { status: 404 });

  const finalHome = patch.homeScore !== undefined ? patch.homeScore : current.homeScore;
  const finalAway = patch.awayScore !== undefined ? patch.awayScore : current.awayScore;
  if (finalHome !== null && finalAway !== null && finalHome === finalAway) {
    return NextResponse.json({ error: "무승부는 허용되지 않습니다." }, { status: 400 });
  }
  patch.playedAt = finalHome !== null && finalAway !== null ? new Date() : null;

  const match = await prisma.knockoutMatch.update({ where: { id }, data: patch });
  return NextResponse.json({ ok: true, match });
}
