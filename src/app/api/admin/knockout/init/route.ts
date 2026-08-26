import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  size: z.union([z.literal(4), z.literal(8), z.literal(16)]),
});

export async function POST(req: Request) {
  await requireAdmin();

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "브래킷 크기는 4/8/16 중 하나여야 합니다." },
      { status: 400 },
    );
  }
  const { size } = parsed.data;
  const totalRounds = Math.log2(size);

  const rows: {
    round: number;
    slot: number;
    isThirdPlace: boolean;
  }[] = [];
  for (let round = 1; round <= totalRounds; round++) {
    const matchesInRound = size / 2 ** round;
    for (let slot = 0; slot < matchesInRound; slot++) {
      rows.push({ round, slot, isThirdPlace: false });
    }
  }
  // 3rd-place match: sits alongside the final (semi-final losers)
  rows.push({ round: totalRounds, slot: 0, isThirdPlace: true });

  await prisma.$transaction([
    prisma.knockoutMatch.deleteMany({}),
    prisma.knockoutMatch.createMany({ data: rows }),
  ]);

  return NextResponse.json({ ok: true, count: rows.length, size });
}

export async function DELETE() {
  await requireAdmin();
  await prisma.knockoutMatch.deleteMany({});
  return NextResponse.json({ ok: true });
}
