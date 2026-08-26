import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(1).max(32),
});

export async function POST(req: Request) {
  await requireAdmin();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
  }
  const max = await prisma.group.aggregate({ _max: { order: true } });
  try {
    const group = await prisma.group.create({
      data: {
        name: parsed.data.name,
        order: (max._max.order ?? -1) + 1,
      },
    });
    return NextResponse.json({ ok: true, group });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "이미 존재하는 조 이름입니다." }, { status: 409 });
    }
    throw e;
  }
}
