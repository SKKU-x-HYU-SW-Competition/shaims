import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { findEntry } from "./guide-tree";

const GUIDE_DIR = path.join(process.cwd(), "content", "guide");

export async function loadGuideMarkdown(slug: string): Promise<string | null> {
  const entry = findEntry(slug);
  if (!entry) return null;
  try {
    return await fs.readFile(path.join(GUIDE_DIR, entry.file), "utf8");
  } catch {
    return null;
  }
}
