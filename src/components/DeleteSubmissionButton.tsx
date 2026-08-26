"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteSubmissionButton({
  id,
  fileName,
}: {
  id: string;
  fileName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function onDelete() {
    if (!confirm(`"${fileName}" 을(를) 삭제할까요?`)) return;
    const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("삭제에 실패했습니다.");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onDelete}
      disabled={pending}
      aria-label="삭제"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
