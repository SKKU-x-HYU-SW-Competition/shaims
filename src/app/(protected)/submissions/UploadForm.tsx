"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <Input
        ref={inputRef}
        type="file"
        accept=".js,.py"
        onChange={onFileChange}
        disabled={uploading}
      />
      <p className="text-xs text-zinc-500">
        .js 또는 .py 파일, 최대 {formatBytes(MAX_UPLOAD_BYTES)}.
      </p>
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
