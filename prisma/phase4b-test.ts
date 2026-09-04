import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeStandings } from "../src/lib/standings";

const prisma = new PrismaClient();

async function main() {
  // 1) ensure P1..P4 participant users
  const hash = await bcrypt.hash("pw12", 10);
  for (const name of ["P1", "P2", "P3", "P4"]) {
    await prisma.user.upsert({
      where: { teamName: name },
      update: {},
      create: { teamName: name, passwordHash: hash, role: Role.PARTICIPANT },
    });
  }

  // 2) ensure group A
  const group = await prisma.group.upsert({
    where: { name: "A" },
    update: {},
    create: { name: "A" },
  });

  // 3) assign all four to group A
  await prisma.user.updateMany({
    where: { teamName: { in: ["P1", "P2", "P3", "P4"] } },
    data: { groupId: group.id },
  });

  // 4) regenerate matches (wipe + create round-robin)
  const teams = await prisma.user.findMany({
    where: { groupId: group.id },
    orderBy: { teamName: "asc" },
    select: { id: true, teamName: true },
  });
  const rows: { groupId: string; order: number; homeUserId: string; awayUserId: string }[] = [];
  let order = 1;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      rows.push({ groupId: group.id, order: order++, homeUserId: teams[i].id, awayUserId: teams[j].id });
    }
  }
  await prisma.groupMatch.deleteMany({ where: { groupId: group.id } });
  await prisma.groupMatch.createMany({ data: rows });
  console.log(`Generated ${rows.length} matches for group A`);

  // 5) score them: P1 beats all, P2 beats P3 and P4, P3 beats P4
  const matches = await prisma.groupMatch.findMany({
    where: { groupId: group.id },
    include: { homeUser: true, awayUser: true },
  });
  for (const m of matches) {
    const pair = [m.homeUser.teamName, m.awayUser.teamName].sort().join("-");
    let winner: string;
    let winnerScore = 3, loserScore = 1;
    if (pair === "P1-P2") { winner = "P1"; }
    else if (pair === "P1-P3") { winner = "P1"; winnerScore = 2; loserScore = 0; }
    else if (pair === "P1-P4") { winner = "P1"; winnerScore = 4; loserScore = 2; }
    else if (pair === "P2-P3") { winner = "P2"; winnerScore = 1; loserScore = 0; }
    else if (pair === "P2-P4") { winner = "P2"; winnerScore = 2; loserScore = 1; }
    else if (pair === "P3-P4") { winner = "P3"; winnerScore = 1; loserScore = 0; }
    else continue;
    const homeIsWinner = m.homeUser.teamName === winner;
    await prisma.groupMatch.update({
      where: { id: m.id },
      data: {
        homeScore: homeIsWinner ? winnerScore : loserScore,
        awayScore: homeIsWinner ? loserScore : winnerScore,
        playedAt: new Date(),
      },
    });
  }

  // 6) compute standings and verify
  const updatedGroup = await prisma.group.findFirstOrThrow({
    where: { name: "A" },
    include: { users: true, matches: true },
  });
  const standings = computeStandings(updatedGroup.users, updatedGroup.matches);

  console.log("\nStandings for group A:");
  console.log(
    standings
      .map(
        (r, i) =>
          `${i + 1}. ${r.teamName}  W${r.wins} L${r.losses}  GF${r.gf} GA${r.ga} GD${r.gd >= 0 ? "+" : ""}${r.gd}  Pts=${r.points}`,
      )
      .join("\n"),
  );

  // Assertions
  const expected = ["P1", "P2", "P3", "P4"];
  const actual = standings.map((s) => s.teamName);
  const orderOk = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`\nOrder P1>P2>P3>P4: ${orderOk ? "OK" : "FAIL"}`);
  const p1 = standings[0];
  console.log(
    `P1 stats: W3 L0 pts9? ${p1.wins === 3 && p1.losses === 0 && p1.points === 9 ? "OK" : "FAIL"}`,
  );

  process.exit(orderOk ? 0 : 1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
