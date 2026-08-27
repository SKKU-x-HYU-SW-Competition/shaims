import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  label: z.string().trim().min(1).max(80),
  url: z.string().trim().min(1).max(500),
  description: z.string().trim().max(200).optional().nullable(),
  order: z.number().int().min(0).max(9999).optional(),
});

export async function POST(req: Request) {
  await requireAdmin();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const { label, url, description, order } = parsed.data;

  let finalOrder = order;
  if (finalOrder === undefined) {
    const max = await prisma.homeLink.aggregate({ _max: { order: true } });
    finalOrder = (max._max.order ?? -1) + 1;
  }

  const link = await prisma.homeLink.create({
    data: {
      label,
      url,
      description: description || null,
      order: finalOrder,
    },
  });
  return NextResponse.json({ ok: true, link });
}
