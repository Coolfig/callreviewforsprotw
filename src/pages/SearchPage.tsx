import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { sportsVideos } from "@/data/sportsVideos";
import PlayCard from "@/components/play/PlayCard";

const leagues = ["All", "NFL", "NBA", "MLB", "NHL"];

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [activeLeague, setActiveLeague] = useState("All");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return sportsVideos.filter(v => {
      const matchesQuery = v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.teams.toLowerCase().includes(q) ||
        v.league.toLowerCase().includes(q);
      const matchesLeague = activeLeague === "All" || v.league === activeLeague;
      return matchesQuery && matchesLeague;
    });
  }, [query, activeLeague]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search plays, teams, rules..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-10 h-12 text-base rounded-xl"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* League filters */}
          <div className="flex items-center gap-2 mb-8">
            {leagues.map(l => (
              <button
                key={l}
                onClick={() => setActiveLeague(l)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${activeLeague === l ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:border-foreground/30"}`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Results */}
          {query.trim() ? (
            results.length > 0 ? (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">{results.length} result{results.length !== 1 ? "s" : ""}</p>
                {results.map(video => (
                  <PlayCard
                    key={video.id}
                    id={video.id}
                    title={video.title}
                    description={video.description}
                    league={video.league}
                    teams={video.teams}
                    date={video.date}
                    gameContext={video.gameContext}
                    isHot={video.isHot}
                    embedUrl={video.embedUrl}
                    videoUrl={video.videoUrl}
                    videoSource={video.videoSource}
                    ruleData={video.ruleData}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="font-semibold text-foreground">No results found</p>
                <p className="text-sm mt-1">Try different keywords or browse the feed</p>
              </div>
            )
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-semibold text-foreground">Search CallReview</p>
              <p className="text-sm mt-1">Find plays, teams, rules, and more</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
