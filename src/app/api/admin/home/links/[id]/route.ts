import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const patchSchema = z.object({
  label: z.string().trim().min(1).max(80).optional(),
  url: z.string().trim().min(1).max(500).optional(),
  description: z.string().trim().max(200).nullable().optional(),
  order: z.number().int().min(0).max(9999).optional(),
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
  const data: {
    label?: string;
    url?: string;
    description?: string | null;
    order?: number;
  } = {};
  if (parsed.data.label !== undefined) data.label = parsed.data.label;
  if (parsed.data.url !== undefined) data.url = parsed.data.url;
  if (parsed.data.description !== undefined) {
    data.description = parsed.data.description || null;
  }
  if (parsed.data.order !== undefined) data.order = parsed.data.order;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "변경할 값이 없습니다." }, { status: 400 });
  }

  const link = await prisma.homeLink.update({ where: { id }, data });
  return NextResponse.json({ ok: true, link });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  await prisma.homeLink.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
