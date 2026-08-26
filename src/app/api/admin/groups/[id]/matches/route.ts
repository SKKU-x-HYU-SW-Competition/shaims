import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  homeUserId: z.string().min(1),
  awayUserId: z.string().min(1),
  homeScore: z.number().int().min(0).max(9999).nullable().optional(),
  awayScore: z.number().int().min(0).max(9999).nullable().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id: groupId } = await params;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const { homeUserId, awayUserId, homeScore, awayScore } = parsed.data;

  if (homeUserId === awayUserId) {
    return NextResponse.json({ error: "같은 팀끼리 배정할 수 없습니다." }, { status: 400 });
  }

  const bothInGroup = await prisma.user.count({
    where: { id: { in: [homeUserId, awayUserId] }, groupId },
  });
  if (bothInGroup !== 2) {
    return NextResponse.json(
      { error: "두 팀 모두 해당 조에 배정되어 있어야 합니다." },
      { status: 400 },
    );
  }

  const h = homeScore ?? null;
  const a = awayScore ?? null;
  const bothSet = h !== null && a !== null;

  const match = await prisma.groupMatch.create({
    data: {
      groupId,
      homeUserId,
      awayUserId,
      homeScore: h,
      awayScore: a,
      playedAt: bothSet ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true, match });
}
