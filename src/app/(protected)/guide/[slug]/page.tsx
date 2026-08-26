import { notFound } from "next/navigation";
import { loadGuideMarkdown } from "@/lib/guide";
import { findEntry } from "@/lib/guide-tree";
import { GuideContent } from "../GuideContent";

export const dynamic = "force-dynamic";

export default async function GuideSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = findEntry(slug);
  if (!entry) notFound();
  const md = await loadGuideMarkdown(slug);
  if (!md) notFound();
  return <GuideContent markdown={md} />;
}
