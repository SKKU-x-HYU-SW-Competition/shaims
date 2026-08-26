import { cn } from "@/lib/utils";
import {
  bracketMeta,
  gridPos,
  roundLabel,
  winnerSide,
  type KnockoutMatchData,
} from "@/lib/knockout";

export function KnockoutView({
  matches,
  meUserId,
}: {
  matches: KnockoutMatchData[];
  meUserId: string;
}) {
  if (matches.length === 0) {
    return (
      <p className="text-sm text-zinc-500 text-center py-8">
        본선 대진표가 아직 생성되지 않았습니다.
      </p>
    );
  }

  const { totalRounds, size, totalRows } = bracketMeta(matches);
  const normalMatches = matches.filter((m) => !m.isThirdPlace);
  const thirdPlace = matches.find((m) => m.isThirdPlace) ?? null;

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto pb-2">
        <div
          className="grid gap-x-6"
          style={{ gridTemplateColumns: `repeat(${totalRounds}, minmax(200px, 1fr))` }}
        >
          {Array.from({ length: totalRounds }, (_, i) => (
            <div
              key={`h-${i}`}
              style={{ gridColumn: i + 1 }}
              className="pb-2 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wide"
            >
              {roundLabel(i + 1, size)}
            </div>
          ))}
        </div>
        <div
          className="grid gap-x-6 gap-y-2"
          style={{
            gridTemplateColumns: `repeat(${totalRounds}, minmax(200px, 1fr))`,
            gridTemplateRows: `repeat(${totalRows}, minmax(72px, auto))`,
          }}
        >
          {normalMatches.map((m) => (
            <div
              key={m.id}
              style={gridPos(m.round, m.slot)}
              className="flex items-center"
            >
              <MatchCardView match={m} meUserId={meUserId} />
            </div>
          ))}
        </div>
      </div>

      {thirdPlace && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            3·4위전
          </h4>
          <div className="max-w-xs">
            <MatchCardView match={thirdPlace} meUserId={meUserId} />
          </div>
        </div>
      )}
    </div>
  );
}

function MatchCardView({
  match,
  meUserId,
}: {
  match: KnockoutMatchData;
  meUserId: string;
}) {
  const winner = winnerSide(match.homeScore, match.awayScore);
  return (
    <div className="w-full rounded-md border bg-white text-sm">
      <SideRow
        team={match.homeUser?.teamName ?? null}
        score={match.homeScore}
        won={winner === "home"}
        isMe={match.homeUserId === meUserId}
        top
      />
      <SideRow
        team={match.awayUser?.teamName ?? null}
        score={match.awayScore}
        won={winner === "away"}
        isMe={match.awayUserId === meUserId}
      />
    </div>
  );
}

function SideRow({
  team,
  score,
  won,
  isMe,
  top,
}: {
  team: string | null;
  score: number | null;
  won: boolean;
  isMe: boolean;
  top?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-3 py-2",
        !top && "border-t",
        won && "bg-zinc-100",
        isMe && "border-l-2 border-l-zinc-900",
      )}
    >
      <span
        className={cn(
          "truncate",
          !team && "text-zinc-400 italic",
          won && "font-semibold",
        )}
      >
        {team ?? "미정"}
        {isMe && team && <span className="ml-1 text-xs text-zinc-500">(나)</span>}
      </span>
      <span
        className={cn(
          "tabular-nums text-right",
          score === null && "text-zinc-400",
        )}
      >
        {score ?? "-"}
      </span>
    </div>
  );
}
