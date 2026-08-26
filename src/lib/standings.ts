export type StandingRow = {
  userId: string;
  teamName: string;
  played: number;
  wins: number;
  losses: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

type UserLike = { id: string; teamName: string };
type MatchLike = {
  homeUserId: string;
  awayUserId: string;
  homeScore: number | null;
  awayScore: number | null;
};

export function computeStandings(
  users: UserLike[],
  matches: MatchLike[],
): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  for (const u of users) {
    rows.set(u.id, {
      userId: u.id,
      teamName: u.teamName,
      played: 0,
      wins: 0,
      losses: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    });
  }
  for (const m of matches) {
    if (m.homeScore === null || m.awayScore === null) continue;
    const home = rows.get(m.homeUserId);
    const away = rows.get(m.awayUserId);
    if (!home || !away) continue;
    home.played += 1;
    away.played += 1;
    home.gf += m.homeScore;
    home.ga += m.awayScore;
    away.gf += m.awayScore;
    away.ga += m.homeScore;
    if (m.homeScore > m.awayScore) {
      home.wins += 1;
      away.losses += 1;
    } else if (m.homeScore < m.awayScore) {
      away.wins += 1;
      home.losses += 1;
    }
  }
  for (const r of rows.values()) {
    r.gd = r.gf - r.ga;
    r.points = r.wins * 3;
  }
  return [...rows.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.gd - a.gd ||
      b.gf - a.gf ||
      a.teamName.localeCompare(b.teamName, "ko"),
  );
}
