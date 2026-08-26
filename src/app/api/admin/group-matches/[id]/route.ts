import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  homeScore: z.number().int().min(0).max(9999).nullable(),
  awayScore: z.number().int().min(0).max(9999).nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "점수가 올바르지 않습니다." }, { status: 400 });
  }

  const { homeScore, awayScore } = parsed.data;
  if (homeScore !== null && awayScore !== null && homeScore === awayScore) {
    return NextResponse.json(
      { error: "무승부는 허용되지 않습니다." },
      { status: 400 },
    );
  }

  const bothSet = homeScore !== null && awayScore !== null;

  const match = await prisma.groupMatch.update({
    where: { id },
    data: {
      homeScore,
      awayScore,
      playedAt: bothSet ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true, match });
}
