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

  const athlete = data.athlete || {};
  const headshot = athlete.headshot?.href || athlete.headshot || "";
  const displayName = athlete.displayName || "Unknown";
  const position = athlete.position?.displayName || athlete.position?.abbreviation || "";
  const jersey = athlete.jersey || "";
  const team = athlete.team?.displayName || "";
  const teamLogo = athlete.team?.logo || athlete.team?.logos?.[0]?.href || "";
  const height = athlete.displayHeight || "";
  const weight = athlete.displayWeight || "";
  const birthdate = athlete.displayBirthPlace || athlete.dateOfBirth || "";
  const experience = athlete.experience?.displayValue || "";
  const draft = athlete.draft?.displayText || "";
  const status = athlete.status?.type?.description || athlete.status?.name || "";

  // Season stats from the overview
  const statsCategories = data.stats || data.statistics || [];
  const seasonStats = statsCategories?.[0]; // Usually current season
  const splits = seasonStats?.splits || seasonStats?.categories?.[0]?.splits || [];

  // Recent games / game log
  const gameLog = data.gameLog || data.gamelog || {};
  const recentEvents = gameLog.events?.slice(0, 5) || [];
  const gameLogLabels = gameLog.labels || gameLog.seasonTypes?.[0]?.categories?.[0]?.labels || [];
  const gameLogEvents = gameLog.seasonTypes?.[0]?.categories?.[0]?.events || recentEvents;

  // Quick stats (top-level summary like PTS, REB, AST)
  const quickStats = data.quickStats || data.statsSummary?.statistics || [];

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-primary hover:underline mb-2">
        <ArrowLeft className="w-3 h-3" /> Back to game
      </button>

      {/* Player header */}
      <div className="flex items-center gap-4">
        {headshot ? (
          <img src={headshot} alt={displayName} className="w-16 h-16 rounded-full object-cover bg-secondary border-2 border-border" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-secondary border-2 border-border" />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-black leading-tight">{displayName}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            {teamLogo && <img src={teamLogo} alt="" className="w-4 h-4 object-contain" />}
            <span className="text-xs text-muted-foreground">
              {team}{jersey ? ` · #${jersey}` : ""}{position ? ` · ${position}` : ""}
            </span>
          </div>
        </div>

        {/* Quick season stats badges */}
        {quickStats.length > 0 && (
          <div className="hidden sm:flex gap-3">
            {quickStats.slice(0, 4).map((stat: any, i: number) => (
              <div key={i} className="text-center">
                <p className="text-[9px] text-muted-foreground uppercase font-semibold">{stat.label || stat.shortDisplayName || stat.name}</p>
                <p className="text-base font-black tabular-nums text-primary">{stat.displayValue || stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Player info row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        {height && (
          <div className="bg-secondary/30 rounded px-2 py-1.5">
            <span className="text-muted-foreground font-semibold">HT/WT</span>
            <p className="font-medium">{height}{weight ? `, ${weight}` : ""}</p>
          </div>
        )}
        {birthdate && (
          <div className="bg-secondary/30 rounded px-2 py-1.5">
            <span className="text-muted-foreground font-semibold">BIRTHPLACE</span>
            <p className="font-medium">{birthdate}</p>
          </div>
        )}
        {draft && (
          <div className="bg-secondary/30 rounded px-2 py-1.5">
            <span className="text-muted-foreground font-semibold">DRAFT</span>
            <p className="font-medium">{draft}</p>
          </div>
        )}
        {status && (
          <div className="bg-secondary/30 rounded px-2 py-1.5">
            <span className="text-muted-foreground font-semibold">STATUS</span>
            <p className="font-medium">{status}</p>
          </div>
        )}
      </div>

      {/* Season Stats Table */}
      {seasonStats && (
        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Season Stats</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-center">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 font-semibold text-muted-foreground">STATS</th>
                  {seasonStats.labels?.map((label: string, i: number) => (
                    <th key={i} className="py-1.5 px-2 font-semibold text-muted-foreground">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {splits.slice(0, 4).map((split: any, i: number) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-secondary/20">
                    <td className="text-left py-1.5 px-2 font-medium">{split.displayName || split.type || "—"}</td>
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
      {gameLogEvents.length > 0 && (
        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Recent Games</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-center">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 font-semibold text-muted-foreground">DATE</th>
                  <th className="text-left py-1.5 px-2 font-semibold text-muted-foreground">OPP</th>
                  <th className="text-left py-1.5 px-2 font-semibold text-muted-foreground">RESULT</th>
                  {gameLogLabels.slice(0, 8).map((label: string, i: number) => (
                    <th key={i} className="py-1.5 px-2 font-semibold text-muted-foreground">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gameLogEvents.slice(0, 5).map((event: any, i: number) => {
                  const opponent = event.opponent?.displayName || event.opponent?.abbreviation || event.atVs || "—";
                  const oppLogo = event.opponent?.logo || event.opponent?.logos?.[0]?.href || "";
                  const result = event.gameResult || event.result || "";
                  const score = event.score || "";
                  const stats = event.stats || event.playerStats || [];
                  const dateStr = event.gameDate
                    ? new Date(event.gameDate).toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" })
                    : "—";

                  return (
                    <tr key={i} className="border-b border-border/30 hover:bg-secondary/20">
                      <td className="text-left py-1.5 px-2 text-muted-foreground">{dateStr}</td>
                      <td className="text-left py-1.5 px-2">
                        <div className="flex items-center gap-1">
                          {event.homeAway === "away" ? "@ " : "vs "}
                          {oppLogo && <img src={oppLogo} alt="" className="w-3.5 h-3.5 object-contain" />}
                          <span className="font-medium">{typeof opponent === "string" ? opponent : opponent}</span>
                        </div>
                      </td>
                      <td className={`text-left py-1.5 px-2 font-semibold ${result === "W" ? "text-green-500" : result === "L" ? "text-destructive" : ""}`}>
                        {result} {score}
                      </td>
                      {stats.slice(0, 8).map((val: string, j: number) => (
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

      {!seasonStats && gameLogEvents.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">No stats available for this player.</p>
      )}
    </div>
  );
};

export default PlayerDetail;
