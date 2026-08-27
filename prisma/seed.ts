import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_HOME_TITLE = "2026 성균관대학교 × 한양대학교 CSE 교류전";
const DEFAULT_HOME_SUBTITLE =
  "이 웹은 AI 부문 운영을 위한 웹사이트입니다.\n참가자 여러분은 팀 별로 코드를 제출하고, 대진을 확인할 수 있으며 가이드를 볼 수 있습니다.";

const DEFAULT_HOME_LINKS = [
  {
    label: "리온이 배구 저장소",
    url: "https://github.com/SKKU-x-HYU-SW-Competition/pikachu-volleyball",
    description: "게임 소스코드 · 로컬 개발 환경",
    order: 0,
  },
  {
    label: "Q&A 시트",
    url: "#",
    description: "질문 · 답변 (관리자가 URL 편집)",
    order: 1,
  },
  {
    label: "대회 저장소",
    url: "#",
    description: "Google Drive (관리자가 URL 편집)",
    order: 2,
  },
  {
    label: "JavaScript 문법",
    url: "https://developer.mozilla.org/ko/docs/Web/JavaScript",
    description: "MDN 공식 문서",
    order: 3,
  },
  {
    label: "Python 문법",
    url: "https://docs.python.org/ko/3/",
    description: "공식 문서 (한국어)",
    order: 4,
  },
  {
    label: "CSE 교류전 인스타그램",
    url: "#",
    description: "대회 소식 (관리자가 URL 편집)",
    order: 5,
  },
];

async function main() {
  const teamName = process.env.SEED_ADMIN_TEAM;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!teamName || !password) {
    throw new Error("SEED_ADMIN_TEAM and SEED_ADMIN_PASSWORD must be set in .env");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { teamName },
    update: { passwordHash, role: Role.ADMIN },
    create: { teamName, passwordHash, role: Role.ADMIN },
  });

  console.log(`Seeded admin: ${admin.teamName} (id=${admin.id})`);

  // Home content — create if not exists, keep existing edits otherwise
  await prisma.homeContent.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      title: DEFAULT_HOME_TITLE,
      subtitle: DEFAULT_HOME_SUBTITLE,
    },
  });
  console.log("Seeded home content (if missing)");

  // Home links — only seed defaults if the table is empty
  const linkCount = await prisma.homeLink.count();
  if (linkCount === 0) {
    await prisma.homeLink.createMany({ data: DEFAULT_HOME_LINKS });
    console.log(`Seeded ${DEFAULT_HOME_LINKS.length} default home links`);
  } else {
    console.log(`Home links already present (${linkCount}); skipped`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
