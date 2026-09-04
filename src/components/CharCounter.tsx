"use client";

import { useState } from "react";

export function CharCounter() {
  const [text, setText] = useState("");

  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, "").length;

  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="여기에 텍스트를 붙여넣으세요"
        rows={6}
        className="w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600">
        <span>
          전체: <span className="font-semibold text-zinc-900">{charCount.toLocaleString()}</span>자
        </span>
        <span>
          공백 제외: <span className="font-semibold text-zinc-900">{charCountNoSpaces.toLocaleString()}</span>자
        </span>
      </div>
    </div>
  );
}
