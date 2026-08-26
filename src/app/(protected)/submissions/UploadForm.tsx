"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ALLOWED_EXTENSIONS,
  MAX_UPLOAD_BYTES,
  formatBytes,
  getExtension,
  isAllowedExtension,
} from "@/lib/submissions";

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return setFile(null);
    const ext = getExtension(f.name);
    if (!isAllowedExtension(ext)) {
      setError(`.${ALLOWED_EXTENSIONS.join(", .")} 파일만 업로드할 수 있습니다.`);
      setFile(null);
      return;
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      setError(`파일 크기는 ${formatBytes(MAX_UPLOAD_BYTES)} 이하여야 합니다.`);
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;
    setError(null);
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/submissions", { method: "POST", body: fd });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };

    setUploading(false);

    if (!res.ok || !data.ok) {
      setError(data.error ?? "업로드에 실패했습니다.");
      return;
    }

    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div className="flex items-center gap-3">
        <label
          htmlFor="submission-file"
          className={cn(
            "inline-flex h-9 items-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white cursor-pointer hover:bg-zinc-800 transition-colors",
            uploading && "pointer-events-none opacity-50",
          )}
        >
          파일 선택
        </label>
        <input
          id="submission-file"
          ref={inputRef}
          type="file"
          accept=".js,.py"
          onChange={onFileChange}
          disabled={uploading}
          className="sr-only"
        />
        <span
          className={cn(
            "text-sm truncate",
            file ? "text-zinc-900" : "text-zinc-400 italic",
          )}
        >
          {file?.name ?? "선택된 파일 없음"}
        </span>
      </div>

      <div className="text-xs text-zinc-500 space-y-1">
        <p>
          파일명은 <b>팀명과 확장자</b>로 해주세요 (예:{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-700">
            teamA.js
          </code>
          ,{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-700">
            teamB.py
          </code>
          ). 저장 시 자동으로{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-700">
            _v버전
          </code>
          이 붙어 내역에 표시됩니다.
        </p>
        <p>
          허용 확장자: .js 또는 .py · 최대 {formatBytes(MAX_UPLOAD_BYTES)}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={!file || uploading}
        className="w-full sm:w-auto justify-self-start"
      >
        <Upload className="size-4" />
        {uploading ? "업로드 중…" : "업로드"}
      </Button>
    </form>
  );
}
