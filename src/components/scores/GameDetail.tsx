import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import type { Game } from "./LiveScoresTicker";
import PlayerDetail from "./PlayerDetail";

interface GameDetailProps {
  game: Game;
  onClose: () => void;
}

const GameDetail = ({ game, onClose }: GameDetailProps) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"gamecast" | "boxscore" | "matchup">("gamecast");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const url = `https://${projectId}.supabase.co/functions/v1/sports-scores?league=${game.league.toLowerCase()}&type=summary&gameId=${game.id}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey },
        });
        const data = await res.json();
        setSummary(data);
      } catch (e) {
        console.error("Failed to fetch game summary:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [game.id, game.league]);

  const isLive = game.status.type.state === "in";
  const isFinal = game.status.type.state === "post";

  // Parse line scores from summary
  const lineScores = summary?.header?.competitions?.[0]?.competitors || [];
  const recentGames = summary?.lastFiveGames || summary?.previousMeetings || [];

  return (
    <div className="fixed top-10 left-0 right-0 z-[55] bg-card border-b border-border shadow-xl animate-fade-in">
      <div className="container mx-auto max-w-4xl px-4 py-4">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-2 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        {/* Score header */}
        <div className="flex items-center justify-between gap-6 mb-4">
          {/* Away team */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="text-right">
              <p className="font-bold text-sm">{game.awayTeam.displayName}</p>
              <p className="text-[10px] text-muted-foreground">{game.awayTeam.record}</p>
            </div>
            <img src={game.awayTeam.logo} alt={game.awayTeam.abbreviation} className="w-12 h-12 object-contain" />
            <span className={`text-3xl font-black tabular-nums ${game.awayTeam.winner ? "text-foreground" : "text-muted-foreground"}`}>
              {game.awayTeam.score}
            </span>
          </div>

          {/* Status */}
          <div className="text-center shrink-0">
            <div className={`text-xs font-bold ${isLive ? "text-green-500" : "text-muted-foreground"}`}>
              {isLive && <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse" />}
              {isFinal ? "Final" : game.status.type.state === "pre" ? game.status.type.description : `${game.status.displayClock}`}
            </div>
            {isLive && <p className="text-[10px] text-muted-foreground mt-0.5">{ordinal(game.status.period)}</p>}
            {game.broadcast && <p className="text-[10px] text-muted-foreground mt-0.5">{game.broadcast}</p>}
          </div>

          {/* Home team */}
          <div className="flex items-center gap-3 flex-1">
            <span className={`text-3xl font-black tabular-nums ${game.homeTeam.winner ? "text-foreground" : "text-muted-foreground"}`}>
              {game.homeTeam.score}
            </span>
            <img src={game.homeTeam.logo} alt={game.homeTeam.abbreviation} className="w-12 h-12 object-contain" />
            <div>
              <p className="font-bold text-sm">{game.homeTeam.displayName}</p>
              <p className="text-[10px] text-muted-foreground">{game.homeTeam.record}</p>
            </div>
          </div>
        </div>

        {/* Line score table */}
        {lineScores.length > 0 && (
          <div className="mb-4 overflow-x-auto">
            <table className="w-full text-[11px] text-center">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1 px-2 font-semibold text-muted-foreground w-16"></th>
                  {lineScores[0]?.linescores?.map((_: any, i: number) => (
                    <th key={i} className="py-1 px-2 font-semibold text-muted-foreground w-8">{i + 1}</th>
                  ))}
                  <th className="py-1 px-2 font-bold w-10">T</th>
                </tr>
              </thead>
              <tbody>
                {lineScores.map((comp: any) => (
                  <tr key={comp.team?.abbreviation} className="border-b border-border/30">
                    <td className="text-left py-1 px-2 font-bold">{comp.team?.abbreviation}</td>
                    {comp.linescores?.map((ls: any, i: number) => (
                      <td key={i} className="py-1 px-2 tabular-nums">{ls.displayValue}</td>
                    ))}
                    <td className="py-1 px-2 font-bold tabular-nums">{comp.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Player detail or tabs */}
        {selectedPlayerId ? (
          <div className="max-h-80 overflow-y-auto subtle-scroll">
            <PlayerDetail
              athleteId={selectedPlayerId}
              league={game.league}
              onBack={() => setSelectedPlayerId(null)}
            />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-4 border-b border-border mb-3">
              {(["gamecast", "boxscore", "matchup"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-semibold pb-2 border-b-2 transition-colors capitalize ${
                    activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "boxscore" ? "Box Score" : tab === "gamecast" ? "Gamecast" : "Matchup"}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {activeTab === "gamecast" && <GamecastTab summary={summary} game={game} onPlayerClick={setSelectedPlayerId} />}
                {activeTab === "boxscore" && <BoxScoreTab summary={summary} onPlayerClick={setSelectedPlayerId} />}
                {activeTab === "matchup" && <MatchupTab summary={summary} game={game} />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Gamecast: key plays, leaders
const GamecastTab = ({ summary, game, onPlayerClick }: { summary: any; game: Game; onPlayerClick: (id: string) => void }) => {
  const leaders = summary?.leaders || [];
  const keyEvents = summary?.keyEvents || summary?.plays?.slice(-8) || [];

  return (
    <div className="space-y-3">
      {/* Leaders */}
      {leaders.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Game Leaders</h4>
          <div className="grid grid-cols-2 gap-3">
            {leaders.slice(0, 2).map((leader: any, i: number) => (
              <div key={i} className="bg-secondary/30 rounded-lg p-2">
                <p className="text-[10px] font-semibold text-muted-foreground mb-1">{leader.team?.abbreviation}</p>
                {leader.leaders?.slice(0, 3).map((cat: any, j: number) => {
                  const topPlayer = cat.leaders?.[0];
                  if (!topPlayer) return null;
                  const headshotUrl = topPlayer.athlete?.headshot?.href || topPlayer.athlete?.headshot || topPlayer.headshot?.href || topPlayer.headshot;
                  return (
                    <button
                      key={j}
                      onClick={() => {
                        const id = topPlayer.athlete?.id || topPlayer.athlete?.playerId;
                        if (id) onPlayerClick(String(id));
                      }}
                      className="flex items-center gap-2 mb-1 hover:bg-secondary/50 rounded px-1 py-0.5 transition-colors cursor-pointer w-full text-left"
                    >
                      {headshotUrl ? (
                        <img src={headshotUrl} alt="" className="w-6 h-6 rounded-full object-cover bg-secondary" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-secondary" />
                      )}
                      <div>
                        <p className="text-[10px] font-medium">{topPlayer.athlete?.displayName || topPlayer.athlete?.shortName || "—"}</p>
                        <p className="text-[9px] text-muted-foreground">{cat.shortDisplayName || cat.displayName}: {topPlayer.displayValue}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Events */}
      {keyEvents.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Recent Plays</h4>
          <div className="space-y-1">
            {keyEvents.slice(-6).map((play: any, i: number) => (
              <div key={i} className="text-[11px] text-muted-foreground border-l-2 border-border pl-2 py-0.5">
                {play.text || play.description || "—"}
              </div>
            ))}
          </div>
        </div>
      )}

      {leaders.length === 0 && keyEvents.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">Game data will appear once the game starts.</p>
      )}
    </div>
  );
};

// Box score: team stats
const BoxScoreTab = ({ summary, onPlayerClick }: { summary: any; onPlayerClick: (id: string) => void }) => {
  const boxscore = summary?.boxscore;
  if (!boxscore) return <p className="text-xs text-muted-foreground text-center py-4">Box score not available yet.</p>;

  const teams = boxscore.teams || [];
  const stats = boxscore.players || [];

  return (
    <div className="space-y-3">
      {/* Team stats comparison */}
      {teams.length >= 2 && (
        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Team Stats</h4>
          <div className="space-y-1">
            {teams[0]?.statistics?.slice(0, 8).map((stat: any, i: number) => {
              const awayStat = stat;
              const homeStat = teams[1]?.statistics?.[i];
              return (
                <div key={i} className="flex items-center text-[11px]">
                  <span className="w-12 text-right font-semibold tabular-nums">{awayStat?.displayValue}</span>
                  <span className="flex-1 text-center text-muted-foreground text-[10px]">{awayStat?.label}</span>
                  <span className="w-12 text-left font-semibold tabular-nums">{homeStat?.displayValue}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Matchup: season series
const MatchupTab = ({ summary, game }: { summary: any; game: Game }) => {
  const standings = summary?.standings || [];
  const seriesHistory = summary?.seasonseries || summary?.header?.competitions?.[0]?.series || null;

  return (
    <div className="space-y-4">
      {/* Season Series */}
      {seriesHistory && (
        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Season Series</h4>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">
              {seriesHistory.summary || `${game.awayTeam.abbreviation} vs ${game.homeTeam.abbreviation}`}
            </p>
          </div>
        </div>
      )}

      {/* Standings */}
      {standings.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Standings</h4>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1 px-1 text-muted-foreground font-semibold">Team</th>
                <th className="py-1 px-1 text-muted-foreground font-semibold">W</th>
                <th className="py-1 px-1 text-muted-foreground font-semibold">L</th>
                <th className="py-1 px-1 text-muted-foreground font-semibold">PCT</th>
                <th className="py-1 px-1 text-muted-foreground font-semibold">GB</th>
                <th className="py-1 px-1 text-muted-foreground font-semibold">STRK</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team: any, i: number) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="text-left py-1 px-1 font-medium">{team.team?.abbreviation || team.team?.displayName}</td>
                  <td className="py-1 px-1 tabular-nums">{team.stats?.find((s: any) => s.name === "wins")?.displayValue || "—"}</td>
                  <td className="py-1 px-1 tabular-nums">{team.stats?.find((s: any) => s.name === "losses")?.displayValue || "—"}</td>
                  <td className="py-1 px-1 tabular-nums">{team.stats?.find((s: any) => s.name === "winPercent")?.displayValue || "—"}</td>
                  <td className="py-1 px-1 tabular-nums">{team.stats?.find((s: any) => s.name === "gamesBehind")?.displayValue || "—"}</td>
                  <td className="py-1 px-1 tabular-nums">{team.stats?.find((s: any) => s.name === "streak")?.displayValue || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!seriesHistory && standings.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">Matchup data not available.</p>
      )}
    </div>
  );
};

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default GameDetail;
