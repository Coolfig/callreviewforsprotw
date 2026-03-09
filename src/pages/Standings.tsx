import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const LEAGUES = ["nba", "nfl", "mlb", "nhl"];
const LEAGUE_LABELS: Record<string, string> = { nba: "NBA", nfl: "NFL", mlb: "MLB", nhl: "NHL" };

// Stat columns we want to show per league
const STAT_COLUMNS = [
  { key: "wins", label: "W" },
  { key: "losses", label: "L" },
  { key: "winPercent", label: "PCT" },
  { key: "gamesBehind", label: "GB" },
  { key: "differential", label: "DIFF" },
  { key: "streak", label: "STRK" },
  { key: "record", label: "L10", altKey: "Last Ten" },
];

const Standings = () => {
  const { league: paramLeague } = useParams();
  const navigate = useNavigate();
  const [league, setLeague] = useState(paramLeague?.toLowerCase() || "nba");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true);
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const url = `https://${projectId}.supabase.co/functions/v1/sports-scores?league=${league}&type=standings`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey },
        });
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Failed to fetch standings:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, [league]);

  const handleLeagueChange = (l: string) => {
    setLeague(l);
    navigate(`/standings/${l}`, { replace: true });
  };

  // Parse standings from ESPN response
  const children = data?.children || [];

  const getStat = (stats: any[], name: string) => {
    const stat = stats?.find((s: any) => s.name === name || s.abbreviation === name);
    return stat?.displayValue || "—";
  };

  const getStatValue = (stats: any[], name: string) => {
    const stat = stats?.find((s: any) => s.name === name);
    return stat?.value ?? 0;
  };

  return (
    <div className="min-h-screen bg-background pt-10">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          {LEAGUE_LABELS[league] || league.toUpperCase()} Standings 2025-26
        </h1>

        {/* League tabs */}
        <div className="flex gap-1 mb-6 bg-secondary/30 rounded-lg p-1 w-fit">
          {LEAGUES.map((l) => (
            <button
              key={l}
              onClick={() => handleLeagueChange(l)}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                league === l
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {LEAGUE_LABELS[l]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : children.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">Standings data not available.</p>
        ) : (
          <div className="space-y-10">
            {children.map((conference: any, ci: number) => (
              <div key={ci}>
                <h2 className="text-lg font-bold text-foreground mb-4">
                  {conference.name || `Conference ${ci + 1}`}
                </h2>

                <div className="overflow-x-auto subtle-scroll">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left py-2 px-3 text-muted-foreground font-semibold w-8">#</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-semibold min-w-[180px]">Team</th>
                        <th className="py-2 px-3 text-muted-foreground font-semibold">W</th>
                        <th className="py-2 px-3 text-muted-foreground font-semibold">L</th>
                        <th className="py-2 px-3 text-muted-foreground font-semibold">PCT</th>
                        <th className="py-2 px-3 text-muted-foreground font-semibold">GB</th>
                        <th className="py-2 px-3 text-muted-foreground font-semibold hidden md:table-cell">HOME</th>
                        <th className="py-2 px-3 text-muted-foreground font-semibold hidden md:table-cell">AWAY</th>
                        <th className="py-2 px-3 text-muted-foreground font-semibold hidden lg:table-cell">PPG</th>
                        <th className="py-2 px-3 text-muted-foreground font-semibold hidden lg:table-cell">OPP PPG</th>
                        <th className="py-2 px-3 text-muted-foreground font-semibold hidden md:table-cell">DIFF</th>
                        <th className="py-2 px-3 text-muted-foreground font-semibold">STRK</th>
                        <th className="py-2 px-3 text-muted-foreground font-semibold hidden md:table-cell">L10</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(conference.standings?.entries || [])
                        .sort((a: any, b: any) => {
                          const aWinPct = getStatValue(a.stats, "winPercent");
                          const bWinPct = getStatValue(b.stats, "winPercent");
                          return bWinPct - aWinPct;
                        })
                        .map((entry: any, i: number) => {
                          const team = entry.team || {};
                          const stats = entry.stats || [];
                          const diff = getStatValue(stats, "differential");
                          const diffColor = diff > 0 ? "text-green-500" : diff < 0 ? "text-red-500" : "text-muted-foreground";

                          // Playoff cutoff: top 6 are guaranteed, 7-10 play-in
                          const isPlayoff = i < 6;
                          const isPlayIn = i >= 6 && i < 10;

                          return (
                            <tr
                              key={team.id || i}
                              className={`border-b border-border/30 hover:bg-secondary/20 transition-colors ${
                                isPlayIn ? "bg-muted/20" : ""
                              } ${i === 5 || i === 9 ? "border-b-2 border-border" : ""}`}
                            >
                              <td className="py-2 px-3 text-muted-foreground tabular-nums">{i + 1}</td>
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-2">
                                  {team.logos?.[0]?.href && (
                                    <img src={team.logos[0].href} alt="" className="w-5 h-5 object-contain" />
                                  )}
                                  <span className="font-medium text-foreground hidden sm:inline">{team.displayName}</span>
                                  <span className="font-medium text-foreground sm:hidden">{team.abbreviation}</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 tabular-nums text-center">{getStat(stats, "wins")}</td>
                              <td className="py-2 px-3 tabular-nums text-center">{getStat(stats, "losses")}</td>
                              <td className="py-2 px-3 tabular-nums text-center font-semibold">{getStat(stats, "winPercent")}</td>
                              <td className="py-2 px-3 tabular-nums text-center text-primary font-semibold">{getStat(stats, "gamesBehind")}</td>
                              <td className="py-2 px-3 tabular-nums text-center hidden md:table-cell">{getStat(stats, "Home")}</td>
                              <td className="py-2 px-3 tabular-nums text-center hidden md:table-cell">{getStat(stats, "Road")}</td>
                              <td className="py-2 px-3 tabular-nums text-center hidden lg:table-cell">{getStat(stats, "pointsFor")}</td>
                              <td className="py-2 px-3 tabular-nums text-center hidden lg:table-cell">{getStat(stats, "pointsAgainst")}</td>
                              <td className={`py-2 px-3 tabular-nums text-center hidden md:table-cell font-semibold ${diffColor}`}>
                                {diff > 0 ? "+" : ""}{getStat(stats, "differential")}
                              </td>
                              <td className="py-2 px-3 tabular-nums text-center">{getStat(stats, "streak")}</td>
                              <td className="py-2 px-3 tabular-nums text-center hidden md:table-cell">{getStat(stats, "Last Ten")}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                <p className="text-[10px] text-muted-foreground mt-2">
                  Teams seeded 7-10 compete in a play-in tournament at the end of the regular season.
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Standings;
