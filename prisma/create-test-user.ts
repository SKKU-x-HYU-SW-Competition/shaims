import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("test1234", 10);
  const user = await prisma.user.upsert({
    where: { teamName: "테스트팀" },
    update: { passwordHash, role: Role.PARTICIPANT },
    create: { teamName: "테스트팀", passwordHash, role: Role.PARTICIPANT },
  });
  console.log(`Created participant: ${user.teamName}`);
}

main().finally(() => prisma.$disconnect());
