import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

interface PlayerDetailProps {
  athleteId: string;
  league: string;
  onBack: () => void;
}

const PlayerDetail = ({ athleteId, league, onBack }: PlayerDetailProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAthlete = async () => {
      setLoading(true);
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const url = `https://${projectId}.supabase.co/functions/v1/sports-scores?league=${league.toLowerCase()}&type=athlete&athleteId=${athleteId}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey },
        });
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Failed to fetch athlete:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAthlete();
  }, [athleteId, league]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Player data not available.</p>
        <button onClick={onBack} className="text-xs text-primary mt-2 hover:underline">← Back</button>
      </div>
    );
  }

  // Extract next event context for summary stats and athlete info
  const nextEvent = data.nextEvent?.[0] || data.nextEvent || {};
  const summaryStats = nextEvent?.summaryStatistics || [];
  const athleteStats = nextEvent?.statistics || data.statistics || {};

  // Season/career stats from top-level `statistics`
  const seasonStats = data.statistics || {};
  const seasonLabels = seasonStats.labels || [];
  const seasonSplits = seasonStats.splits || [];

  // Splits from next event statistics (This Game, L10, vs OPP, Road)
  const gameSplits = athleteStats.splits || [];
  const gameLabels = athleteStats.labels || [];

  // Game log - events is an OBJECT keyed by game ID
  const gameLog = data.gameLog || {};
  const gameLogEventsObj = gameLog.events || {};
  const gameLogStatistics = gameLog.statistics?.[0] || {};
  const gameLogLabels = gameLogStatistics.labels || [];
  const gameLogStatEvents = gameLogStatistics.events || [];

  // Convert events object to sorted array (most recent first)
  const gameLogEntries = Object.values(gameLogEventsObj) as any[];
  gameLogEntries.sort((a: any, b: any) => {
    const da = new Date(a.gameDate || 0).getTime();
    const db = new Date(b.gameDate || 0).getTime();
    return db - da;
  });

  // Map stat events to game entries by eventId
  const statsByEventId: Record<string, string[]> = {};
  for (const se of gameLogStatEvents) {
    if (se.eventId) statsByEventId[se.eventId] = se.stats || [];
  }

  // Headshot from the scoreboard data (not in this API, use ESPN CDN pattern)
  const headshotUrl = `https://a.espncdn.com/i/headshots/nba/players/full/${athleteId}.png`;

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-primary hover:underline mb-2">
        <ArrowLeft className="w-3 h-3" /> Back to game
      </button>

      {/* Summary stat badges (PPG, APG, 3P%, FG%) */}
      {summaryStats.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {summaryStats.map((stat: any, i: number) => (
            <div key={i} className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 text-center min-w-[70px]">
              <p className="text-[9px] text-primary font-bold uppercase">{stat.shortDisplayName || stat.abbreviation}</p>
              <p className="text-xl font-black tabular-nums text-primary">{stat.displayValue}</p>
            </div>
          ))}
        </div>
      )}

      {/* Splits table (This Game, L10, vs OPP, Road) */}
      {gameSplits.length > 0 && gameLabels.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Splits</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-center">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 font-semibold text-muted-foreground">SPLITS</th>
                  {gameLabels.map((label: string, i: number) => (
                    <th key={i} className="py-1.5 px-2 font-semibold text-muted-foreground">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gameSplits.map((split: any, i: number) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-secondary/20">
                    <td className="text-left py-1.5 px-2 font-medium">{split.displayName || "—"}</td>
                    {split.stats?.map((val: string, j: number) => (
                      <td key={j} className="py-1.5 px-2 tabular-nums">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Season Stats (Regular Season, Career) */}
      {seasonSplits.length > 0 && seasonLabels.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Stats</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-center">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 font-semibold text-muted-foreground">STATS</th>
                  {seasonLabels.map((label: string, i: number) => (
                    <th key={i} className="py-1.5 px-2 font-semibold text-muted-foreground">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seasonSplits.map((split: any, i: number) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-secondary/20">
                    <td className="text-left py-1.5 px-2 font-medium">{split.displayName || "—"}</td>
                    {split.stats?.map((val: string, j: number) => (
                      <td key={j} className="py-1.5 px-2 tabular-nums">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Games */}
      {gameLogEntries.length > 0 && gameLogLabels.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Recent Games</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-center">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 font-semibold text-muted-foreground">DATE</th>
                  <th className="text-left py-1.5 px-2 font-semibold text-muted-foreground">OPP</th>
                  <th className="text-left py-1.5 px-2 font-semibold text-muted-foreground">RESULT</th>
                  {gameLogLabels.map((label: string, i: number) => (
                    <th key={i} className="py-1.5 px-2 font-semibold text-muted-foreground">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gameLogEntries.slice(0, 5).map((event: any, i: number) => {
                  const oppName = event.opponent?.abbreviation || event.opponent?.displayName || "—";
                  const oppLogo = event.opponent?.logo || "";
                  const result = event.gameResult || "";
                  const score = event.score || "";
                  const isHome = event.atVs === "vs";
                  const stats = statsByEventId[event.id] || [];
                  const dateStr = event.gameDate
                    ? new Date(event.gameDate).toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" })
                    : "—";

                  return (
                    <tr key={i} className="border-b border-border/30 hover:bg-secondary/20">
                      <td className="text-left py-1.5 px-2 text-muted-foreground whitespace-nowrap">{dateStr}</td>
                      <td className="text-left py-1.5 px-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">{isHome ? "vs" : "@"}</span>
                          {oppLogo && <img src={oppLogo} alt="" className="w-3.5 h-3.5 object-contain" />}
                          <span className="font-medium">{oppName}</span>
                        </div>
                      </td>
                      <td className={`text-left py-1.5 px-2 font-semibold whitespace-nowrap ${result === "W" ? "text-green-500" : result === "L" ? "text-destructive" : ""}`}>
                        {result} {score}
                      </td>
                      {stats.map((val: string, j: number) => (
                        <td key={j} className="py-1.5 px-2 tabular-nums">{val}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {gameSplits.length === 0 && seasonSplits.length === 0 && gameLogEntries.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">No stats available for this player.</p>
      )}
    </div>
  );
};

export default PlayerDetail;
