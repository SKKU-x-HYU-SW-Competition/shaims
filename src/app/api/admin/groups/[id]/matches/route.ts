import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  homeUserId: z.string().min(1),
  awayUserId: z.string().min(1),
  homeScore: z.number().int().min(0).max(9999).nullable().optional(),
  awayScore: z.number().int().min(0).max(9999).nullable().optional(),
  order: z.number().int().min(1).max(9999).nullable().optional(),
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

  const { homeUserId, awayUserId, homeScore, awayScore, order: requestedOrder } = parsed.data;

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

  let order: number;
  if (requestedOrder != null) {
    const dup = await prisma.groupMatch.findFirst({
      where: { groupId, order: requestedOrder },
      select: { id: true },
    });
    if (dup) {
      return NextResponse.json(
        { error: `매치 #${requestedOrder} 은(는) 이미 존재합니다.` },
        { status: 400 },
      );
    }
    order = requestedOrder;
  } else {
    const max = await prisma.groupMatch.aggregate({
      where: { groupId },
      _max: { order: true },
    });
    order = (max._max.order ?? 0) + 1;
  }

  const match = await prisma.groupMatch.create({
    data: {
      groupId,
      order,
      homeUserId,
      awayUserId,
      homeScore: h,
      awayScore: a,
      playedAt: bothSet ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true, match });
}
