import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  teamName: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(128),
});

const INVALID = { error: "팀명 또는 비밀번호가 올바르지 않습니다." };

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(INVALID, { status: 400 });
  }

  const { teamName, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { teamName } });
  if (!user) return NextResponse.json(INVALID, { status: 401 });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return NextResponse.json(INVALID, { status: 401 });

  const session = await getSession();
  session.userId = user.id;
  session.teamName = user.teamName;
  session.role = user.role;
  await session.save();

  return NextResponse.json({
    ok: true,
    role: user.role,
    teamName: user.teamName,
  });
}
