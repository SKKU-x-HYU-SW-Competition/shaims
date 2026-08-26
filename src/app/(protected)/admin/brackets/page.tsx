import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewGroupForm } from "./NewGroupForm";
import { AssignTeamsPanel } from "./AssignTeamsPanel";
import { GroupCard } from "./GroupCard";
import { KnockoutAdmin } from "./KnockoutAdmin";

export const dynamic = "force-dynamic";

export default async function AdminBracketsPage() {
  const [groups, unassigned, knockoutMatches, participants] = await Promise.all([
    prisma.group.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        users: {
          select: { id: true, teamName: true },
          orderBy: { teamName: "asc" },
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
    prisma.user.findMany({
      where: { role: "PARTICIPANT", groupId: null },
      select: { id: true, teamName: true },
      orderBy: { teamName: "asc" },
    }),
    prisma.knockoutMatch.findMany({
      orderBy: [{ isThirdPlace: "asc" }, { round: "asc" }, { slot: "asc" }],
      include: {
        homeUser: { select: { teamName: true } },
        awayUser: { select: { teamName: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "PARTICIPANT" },
      select: { id: true, teamName: true },
      orderBy: { teamName: "asc" },
    }),
  ]);

  const groupList = groups.map((g) => ({ id: g.id, name: g.name }));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">대진 관리</h1>
        <p className="text-sm text-zinc-600">
          예선 조 편성과 본선 토너먼트를 관리합니다.
        </p>
      </div>

      <Tabs defaultValue="group">
        <TabsList>
          <TabsTrigger value="group">예선 (조별리그)</TabsTrigger>
          <TabsTrigger value="knockout">본선 (토너먼트)</TabsTrigger>
        </TabsList>

        <TabsContent value="group" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>새 조</CardTitle>
                <CardDescription>
                  A, B, C 등 짧은 이름으로 만드는 편이 편합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewGroupForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>미배정 팀 ({unassigned.length})</CardTitle>
                <CardDescription>
                  아직 조에 배정되지 않은 참가팀을 선택해 배치하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssignTeamsPanel
                  unassigned={unassigned}
                  groups={groupList}
                />
              </CardContent>
            </Card>
          </div>

          {groups.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">
              생성된 조가 없습니다.
            </p>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {groups.map((g) => (
                <GroupCard key={g.id} group={g} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="knockout">
          <Card>
            <CardHeader>
              <CardTitle>본선 토너먼트</CardTitle>
              <CardDescription>
                브래킷 크기를 정해 생성한 뒤 각 매치에 팀과 점수를 입력하세요.
                진출자는 관리자가 직접 다음 라운드에 배치합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KnockoutAdmin
                matches={knockoutMatches}
                participants={participants}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
