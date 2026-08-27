import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContentEditor } from "./ContentEditor";
import { LinksEditor } from "./LinksEditor";

export const dynamic = "force-dynamic";

const FALLBACK_TITLE = "2026 성균관대학교 × 한양대학교 CSE 교류전";
const FALLBACK_SUBTITLE =
  "이 웹은 AI 부문 운영을 위한 웹사이트입니다.\n참가자 여러분은 팀 별로 코드를 제출하고, 대진을 확인할 수 있으며 가이드를 볼 수 있습니다.";

export default async function AdminHomePage() {
  const [content, links] = await Promise.all([
    prisma.homeContent.findUnique({ where: { id: "main" } }),
    prisma.homeLink.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">홈 편집</h1>
          <p className="text-sm text-zinc-600">
            메인 페이지의 소개 문구와 바로가기 링크를 관리합니다.
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4" />홈으로
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>소개 문구</CardTitle>
          <CardDescription>
            제목과 소개 문구는 모든 로그인 사용자에게 보여집니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContentEditor
            initialTitle={content?.title ?? FALLBACK_TITLE}
            initialSubtitle={content?.subtitle ?? FALLBACK_SUBTITLE}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>바로가기 링크</CardTitle>
          <CardDescription>
            홈에 카드 형태로 표시됩니다. 순서는 오름차순.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinksEditor links={links} />
        </CardContent>
      </Card>
    </div>
  );
}
