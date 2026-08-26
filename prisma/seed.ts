import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
