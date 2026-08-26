"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { slugFromFilename } from "@/lib/guide-tree";

export function GuideContent({ markdown }: { markdown: string }) {
  return (
    <article className="prose prose-zinc max-w-none prose-headings:tracking-tight prose-pre:bg-zinc-950 prose-pre:text-zinc-100 prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ href, children, ...props }) => {
            const url = href ?? "";
            if (/^https?:\/\//i.test(url) || url.startsWith("//") || url.startsWith("mailto:")) {
              return (
                <a href={url} target="_blank" rel="noreferrer noopener" {...props}>
                  {children}
                </a>
              );
            }
            if (url.startsWith("#")) {
              return (
                <a href={url} {...props}>
                  {children}
                </a>
              );
            }
            const slug = slugFromFilename(url);
            if (slug === null) {
              return (
                <a href={url} {...props}>
                  {children}
                </a>
              );
            }
            const to = slug === "" ? "/guide" : `/guide/${slug}`;
            return <Link href={to}>{children}</Link>;
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
