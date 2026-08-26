import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";

const createSchema = z.object({
  teamName: z.string().trim().min(1).max(64),
  password: z.string().min(4).max(128),
  role: z.enum(["ADMIN", "PARTICIPANT"]).default("PARTICIPANT"),
});

export async function POST(req: Request) {
  await requireAdmin();

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const { teamName, password, role } = parsed.data;
  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: { teamName, passwordHash, role },
      select: { id: true, teamName: true, role: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "이미 존재하는 팀명입니다." }, { status: 409 });
    }
    throw e;
  }
}
