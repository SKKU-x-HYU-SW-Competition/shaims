import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";

const patchSchema = z.object({
  password: z.string().min(4).max(128).optional(),
  teamName: z.string().trim().min(1).max(64).optional(),
  groupId: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const data: { passwordHash?: string; teamName?: string; groupId?: string | null } = {};
  if (parsed.data.password) data.passwordHash = await hashPassword(parsed.data.password);
  if (parsed.data.teamName) data.teamName = parsed.data.teamName;
  if (parsed.data.groupId !== undefined) data.groupId = parsed.data.groupId;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "변경할 값이 없습니다." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, teamName: true, role: true, groupId: true },
  });

  return NextResponse.json({ ok: true, user });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  const { id } = await params;

  if (id === admin.userId) {
    return NextResponse.json(
      { error: "본인 계정은 삭제할 수 없습니다." },
      { status: 400 },
    );
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
