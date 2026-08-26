export type KnockoutMatchData = {
  id: string;
  round: number;
  slot: number;
  isThirdPlace: boolean;
  homeUserId: string | null;
  awayUserId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeUser: { teamName: string } | null;
  awayUser: { teamName: string } | null;
};

export function bracketMeta(matches: KnockoutMatchData[]) {
  const totalRounds =
    matches.length > 0 ? Math.max(...matches.map((m) => m.round)) : 0;
  const size = totalRounds > 0 ? 1 << totalRounds : 0;
  const totalRows = size > 0 ? size / 2 : 0;
  return { totalRounds, size, totalRows };
}

export function roundLabel(round: number, size: number): string {
  const teams = size / (1 << (round - 1));
  if (teams === 2) return "결승";
  if (teams === 4) return "준결승";
  return `${teams}강`;
}

export function gridPos(round: number, slot: number) {
  const span = 1 << (round - 1);
  const start = slot * span + 1;
  return { gridColumn: round, gridRow: `${start} / span ${span}` };
}

export function winnerSide(
  homeScore: number | null,
  awayScore: number | null,
): "home" | "away" | null {
  if (homeScore === null || awayScore === null) return null;
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return null;
}
