import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CharCounter } from "@/components/CharCounter";

export const dynamic = "force-dynamic";

const FALLBACK_TITLE = "2026 성균관대학교 × 한양대학교 CSE 교류전";
const FALLBACK_SUBTITLE =
  "이 웹은 AI 부문 운영을 위한 웹사이트입니다.\n참가자 여러분은 팀 별로 코드를 제출하고, 대진을 확인할 수 있으며 가이드를 볼 수 있습니다.";

export default async function HomePage() {
  const user = await requireUser();
  const [content, links] = await Promise.all([
    prisma.homeContent.findUnique({ where: { id: "main" } }),
    prisma.homeLink.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
  ]);

  const title = content?.title ?? FALLBACK_TITLE;
  const subtitle = content?.subtitle ?? FALLBACK_SUBTITLE;

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        {user.role === "ADMIN" && (
          <div className="flex justify-end">
            <Link href="/admin/home">
              <Button variant="outline" size="sm">
                <Pencil className="size-4" />홈 편집
              </Button>
            </Link>
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {title}
        </h1>
        <p className="text-base text-zinc-600 whitespace-pre-line leading-relaxed">
          {subtitle}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
          바로가기
        </h2>
        {links.length === 0 ? (
          <p className="text-sm text-zinc-500 py-8 text-center rounded-xl border border-dashed">
            등록된 바로가기가 없습니다.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group rounded-xl border bg-white p-4 hover:border-zinc-900 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 break-words">
                      {l.label}
                    </p>
                    {l.description && (
                      <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                        {l.description}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="size-4 text-zinc-400 group-hover:text-zinc-900 shrink-0" />
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
          글자 수 세기(LLM 질문용)
        </h2>
        <CharCounter />
      </section>
    </div>
  );
}
