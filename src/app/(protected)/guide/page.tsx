import { loadGuideMarkdown } from "@/lib/guide";
import { GuideContent } from "./GuideContent";

export const dynamic = "force-dynamic";

export default async function GuideIndexPage() {
  const md = await loadGuideMarkdown("");
  return <GuideContent markdown={md ?? "# 소개 문서를 찾을 수 없습니다."} />;
}
