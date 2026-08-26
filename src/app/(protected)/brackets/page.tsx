import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { computeStandings } from "@/lib/standings";
import { requireUser } from "@/lib/auth";
import { KnockoutView } from "./KnockoutView";

export const dynamic = "force-dynamic";

export default async function BracketsPage() {
  const me = await requireUser();
  const [groups, knockoutMatches] = await Promise.all([
    prisma.group.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        users: {
          select: { id: true, teamName: true },
        },
        matches: {
          include: {
            homeUser: { select: { teamName: true } },
            awayUser: { select: { teamName: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.knockoutMatch.findMany({
      orderBy: [{ isThirdPlace: "asc" }, { round: "asc" }, { slot: "asc" }],
      include: {
        homeUser: { select: { teamName: true } },
        awayUser: { select: { teamName: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">대진</h1>
        <p className="text-sm text-zinc-600">
          예선 순위와 본선 대진표를 확인합니다.
        </p>
      </div>

      <Tabs defaultValue="group">
        <TabsList>
          <TabsTrigger value="group">예선 (조별리그)</TabsTrigger>
          <TabsTrigger value="knockout">본선 (토너먼트)</TabsTrigger>
        </TabsList>

        <TabsContent value="group" className="space-y-6">
          {groups.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">
              아직 조 편성이 이루어지지 않았습니다.
            </p>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {groups.map((g) => {
                const standings = computeStandings(g.users, g.matches);
                return (
                  <Card key={g.id}>
                    <CardHeader>
                      <CardTitle>조 {g.name}</CardTitle>
                      <CardDescription>
                        {g.users.length}팀 / {g.matches.length}경기
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <section className="space-y-2">
                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                          순위표
                        </h4>
                        {standings.length === 0 ? (
                          <p className="text-sm text-zinc-500">
                            팀이 없습니다.
                          </p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-8">#</TableHead>
                                <TableHead>팀</TableHead>
                                <TableHead className="w-10 text-right">
                                  P
                                </TableHead>
                                <TableHead className="w-10 text-right">
                                  W
                                </TableHead>
                                <TableHead className="w-10 text-right">
                                  D
                                </TableHead>
                                <TableHead className="w-10 text-right">
                                  L
                                </TableHead>
                                <TableHead className="w-12 text-right">
                                  GF
                                </TableHead>
                                <TableHead className="w-12 text-right">
                                  GA
                                </TableHead>
                                <TableHead className="w-12 text-right">
                                  GD
                                </TableHead>
                                <TableHead className="w-12 text-right">
                                  Pts
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {standings.map((s, i) => {
                                const isMe = s.userId === me.userId;
                                return (
                                  <TableRow
                                    key={s.userId}
                                    className={isMe ? "bg-zinc-100" : undefined}
                                  >
                                    <TableCell className="text-zinc-600 tabular-nums">
                                      {i + 1}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                      {s.teamName}
                                      {isMe && (
                                        <span className="ml-1 text-xs text-zinc-500">
                                          (나)
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                      {s.played}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                      {s.wins}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                      {s.draws}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                      {s.losses}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                      {s.gf}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                      {s.ga}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                      {s.gd > 0 ? `+${s.gd}` : s.gd}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold tabular-nums">
                                      {s.points}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        )}
                      </section>

                      {g.matches.length > 0 && (
                        <section className="space-y-2">
                          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                            경기 결과
                          </h4>
                          <ul className="space-y-1">
                            {g.matches.map((m) => (
                              <li
                                key={m.id}
                                className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
                              >
                                <span className="text-right">
                                  {m.homeUser.teamName}
                                </span>
                                <span className="tabular-nums text-zinc-700">
                                  {m.homeScore ?? "-"} : {m.awayScore ?? "-"}
                                </span>
                                <span>{m.awayUser.teamName}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="knockout">
          <Card>
            <CardHeader>
              <CardTitle>본선 토너먼트</CardTitle>
              <CardDescription>
                결과가 확정된 매치는 승자 이름이 강조됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KnockoutView matches={knockoutMatches} meUserId={me.userId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
