export const ALLOWED_EXTENSIONS = ["js", "py"] as const;
export type Language = (typeof ALLOWED_EXTENSIONS)[number];

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot < 0) return "";
  return fileName.slice(dot + 1).toLowerCase();
}

export function isAllowedExtension(ext: string): ext is Language {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// 파일 시스템·HTTP 헤더에서 문제 되는 문자를 언더스코어로 치환
export function sanitizeForFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>\r\n]/g, "_").trim() || "team";
}
