import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GameDetail from "./GameDetail";

interface Team {
  id: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  logo: string;
  score: string;
  winner?: boolean;
  record?: string;
}

interface GameStatus {
  type: { id: string; name: string; state: string; completed: boolean; description: string };
  displayClock: string;
  period: number;
}

export interface Game {
  id: string;
  name: string;
  shortName: string;
  status: GameStatus;
  homeTeam: Team;
  awayTeam: Team;
  broadcast?: string;
  league: string;
}

const LEAGUES = ["nba", "nfl", "mlb", "nhl"];
const LEAGUE_LABELS: Record<string, string> = { nba: "NBA", nfl: "NFL", mlb: "MLB", nhl: "NHL" };

function parseGames(data: any, league: string): Game[] {
  if (!data?.events) return [];
  return data.events.map((event: any) => {
    const comp = event.competitions?.[0];
    if (!comp) return null;

    const home = comp.competitors?.find((c: any) => c.homeAway === "home");
    const away = comp.competitors?.find((c: any) => c.homeAway === "away");
    if (!home || !away) return null;

    const broadcast = comp.broadcasts?.[0]?.names?.[0] || "";

    return {
      id: event.id,
      name: event.name,
      shortName: event.shortName,
      status: event.status,
      homeTeam: {
        id: home.team.id,
        abbreviation: home.team.abbreviation,
        displayName: home.team.displayName,
        shortDisplayName: home.team.shortDisplayName || home.team.abbreviation,
        logo: home.team.logo,
        score: home.score || "0",
        winner: home.winner,
        record: home.records?.[0]?.summary || "",
      },
      awayTeam: {
        id: away.team.id,
        abbreviation: away.team.abbreviation,
        displayName: away.team.displayName,
        shortDisplayName: away.team.shortDisplayName || away.team.abbreviation,
        logo: away.team.logo,
        score: away.score || "0",
        winner: away.winner,
        record: away.records?.[0]?.summary || "",
      },
      broadcast,
      league: league.toUpperCase(),
    } as Game;
  }).filter(Boolean) as Game[];
}

const LiveScoresTicker = () => {
  const [activeLeague, setActiveLeague] = useState("nba");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchScores = async (league: string, isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const url = `https://${projectId}.supabase.co/functions/v1/sports-scores?league=${league}&type=scoreboard`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey },
      });
      const json = await res.json();
      const parsed = parseGames(json, league);
      // Sort: live games first, then pre-game, then final
      parsed.sort((a, b) => {
        const order = (g: Game) => g.status.type.state === "in" ? 0 : g.status.type.state === "pre" ? 1 : 2;
        return order(a) - order(b);
      });
      setGames(parsed);
    } catch (e) {
      console.error("Failed to fetch scores:", e);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores(activeLeague);
    const interval = setInterval(() => fetchScores(activeLeague), 30000);
    return () => clearInterval(interval);
  }, [activeLeague]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  const getStatusText = (game: Game) => {
    const s = game.status;
    if (s.type.state === "post") return "Final";
    if (s.type.state === "pre") {
      const desc = s.type.description || s.type.name;
      return desc;
    }
    // In progress
    const periodLabel = game.league === "NHL" || game.league === "NBA" 
      ? `${ordinal(s.period)}` 
      : game.league === "NFL" 
        ? `${ordinal(s.period)}`
        : `${ordinal(s.period)}`;
    return `${s.displayClock} - ${periodLabel}`;
  };

  const isLive = (game: Game) => game.status.type.state === "in";

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[60] bg-card border-b border-border">
        <div className="flex items-center h-10">
          {/* League selector */}
          <div className="flex items-center gap-0 border-r border-border shrink-0">
            {LEAGUES.map((l) => (
              <button
                key={l}
                onClick={() => { setActiveLeague(l); setSelectedGame(null); }}
                className={`px-3 h-10 text-xs font-bold transition-colors ${
                  activeLeague === l
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {LEAGUE_LABELS[l]}
              </button>
            ))}
          </div>

          {/* Scroll left */}
          <button onClick={() => scroll("left")} className="shrink-0 px-1 h-10 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Games ticker */}
          <div ref={scrollRef} className="flex-1 overflow-x-auto ticker-scroll flex items-stretch" style={{ scrollbarWidth: 'none' }}>
            {loading ? (
              <div className="flex items-center justify-center w-full text-xs text-muted-foreground py-2">Loading scores...</div>
            ) : games.length === 0 ? (
              <div className="flex items-center justify-center w-full text-xs text-muted-foreground py-2">No games today</div>
            ) : (
              games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(selectedGame?.id === game.id ? null : game)}
                  className={`shrink-0 flex flex-col items-center justify-center px-4 h-10 border-r border-border/50 hover:bg-secondary/30 transition-colors min-w-[140px] ${
                    selectedGame?.id === game.id ? "bg-secondary/50" : ""
                  }`}
                >
                  {/* Status line */}
                  <div className={`text-[9px] font-semibold leading-none mb-0.5 ${isLive(game) ? "text-green-500" : "text-muted-foreground"}`}>
                    {isLive(game) && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse" />}
                    {getStatusText(game)}
                    {game.broadcast && <span className="ml-1 text-muted-foreground/60">{game.broadcast}</span>}
                  </div>

                  {/* Teams */}
                  <div className="flex items-center gap-3 text-[11px] leading-tight">
                    <div className="flex items-center gap-1">
                      <img src={game.awayTeam.logo} alt="" className="w-3.5 h-3.5 object-contain" />
                      <span className={`font-semibold ${game.awayTeam.winner ? "text-foreground" : "text-muted-foreground"}`}>
                        {game.awayTeam.abbreviation}
                      </span>
                      <span className={`font-bold tabular-nums ${game.awayTeam.winner ? "text-foreground" : "text-muted-foreground"}`}>
                        {game.awayTeam.score}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <img src={game.homeTeam.logo} alt="" className="w-3.5 h-3.5 object-contain" />
                      <span className={`font-semibold ${game.homeTeam.winner ? "text-foreground" : "text-muted-foreground"}`}>
                        {game.homeTeam.abbreviation}
                      </span>
                      <span className={`font-bold tabular-nums ${game.homeTeam.winner ? "text-foreground" : "text-muted-foreground"}`}>
                        {game.homeTeam.score}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Scroll right */}
          <button onClick={() => scroll("right")} className="shrink-0 px-1 h-10 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game detail panel */}
      {selectedGame && (
        <GameDetail game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}
    </>
  );
};

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default LiveScoresTicker;
