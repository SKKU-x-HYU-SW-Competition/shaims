import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;

  const group = await prisma.group.findUnique({
    where: { id },
    include: { users: { select: { id: true } } },
  });
  if (!group) return NextResponse.json({ error: "not found" }, { status: 404 });

  const teams = group.users;
  const rows: { groupId: string; homeUserId: string; awayUserId: string }[] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      rows.push({ groupId: id, homeUserId: teams[i].id, awayUserId: teams[j].id });
    }
  }

  await prisma.$transaction([
    prisma.groupMatch.deleteMany({ where: { groupId: id } }),
    ...(rows.length > 0
      ? [prisma.groupMatch.createMany({ data: rows })]
      : []),
  ]);

  return NextResponse.json({ ok: true, count: rows.length });
}
