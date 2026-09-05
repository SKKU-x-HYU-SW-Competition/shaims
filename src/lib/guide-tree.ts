export type GuideEntry = {
  slug: string;
  title: string;
  file: string;
};

export type GuideGroup = {
  group: string;
  items: GuideEntry[];
};

// 이 배열의 순서/구성이 좌측 사이드바와 URL을 결정합니다.
// 예제 봇 파일 교체 시 `items` 세 줄만 손보면 됩니다.
export const GUIDE_TREE: GuideGroup[] = [
  {
    group: "시작하기",
    items: [
      { slug: "", title: "소개", file: "intro.md" },
      { slug: "getting-started", title: "환경 세팅 · 실행", file: "getting-started.md" },
    ],
  },
  {
    group: "API",
    items: [
      { slug: "api", title: "decide 함수와 스냅샷", file: "api.md" },
      { slug: "api-python", title: "Python 봇 특이사항", file: "api-python.md" },
      { slug: "skills", title: "스킬 시스템", file: "skills.md" },
    ],
  },
  {
    group: "예제 봇",
    items: [
      { slug: "minimal", title: "Minimal — 뼈대", file: "examples/minimal.md" },
      { slug: "no-hit-positioning", title: "Positioning — 몸으로만 막기", file: "examples/no-hit-positioning.md" },
      { slug: "power-hit", title: "Power Hit — 파워히트로 공격", file: "examples/power-hit.md" },
    ],
  },
  {
    group: "규칙 및 주의사항",
    items: [
      { slug: "rules", title: "대회 규칙", file: "rules.md" },
      { slug: "caveats", title: "자주 걸리는 함정", file: "caveats.md" },
    ],
  },
];

export function findEntry(slug: string): (GuideEntry & { group: string }) | null {
  for (const g of GUIDE_TREE) {
    for (const item of g.items) {
      if (item.slug === slug) return { ...item, group: g.group };
    }
  }
  return null;
}

// 파일명(상대경로) → 슬러그 매핑.
// 마크다운 안의 `[텍스트](getting-started.md)` 같은 링크를 `/guide/getting-started`로
// 변환하는 데 사용합니다. 서브폴더(`examples/minimal.md`)와 상위경로(`../api.md`)도
// 파일명(basename) 기준으로 해석합니다.
export function slugFromFilename(filename: string): string | null {
  const clean = filename.split("#")[0]?.split("?")[0] ?? filename;
  const base = clean.split("/").pop() ?? clean;
  const stem = base.replace(/\.md$/i, "").toLowerCase();
  if (!stem) return null;
  for (const g of GUIDE_TREE) {
    for (const item of g.items) {
      const itemBase = (item.file.split("/").pop() ?? item.file)
        .replace(/\.md$/i, "")
        .toLowerCase();
      if (itemBase === stem) return item.slug;
    }
  }
  // "README" 같은 관용 파일명은 소개로 매핑
  if (stem === "readme" || stem === "index") return "";
  return null;
}
