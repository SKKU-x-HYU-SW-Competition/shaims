import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().min(0).max(1000),
});

export async function PUT(req: Request) {
  await requireAdmin();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }
  const { title, subtitle } = parsed.data;
  const content = await prisma.homeContent.upsert({
    where: { id: "main" },
    update: { title, subtitle },
    create: { id: "main", title, subtitle },
  });
  return NextResponse.json({ ok: true, content });
}
