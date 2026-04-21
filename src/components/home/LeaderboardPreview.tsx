import { Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { sportsVideos } from "@/data/sportsVideos";

const LeaderboardPreview = () => {
  const navigate = useNavigate();
  const ranked = sportsVideos.slice(0, 5);

  return (
    <section id="leaderboard" className="py-20 bg-card/40 border-y border-border">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 mb-3">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Leaderboard</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Most controversial calls
          </h2>
          <p className="text-muted-foreground">Ranked by community vote volume — no algorithms, just debate.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {ranked.map((v, i) => {
            const isTop = i === 0;
            const jump = () => {
              const el = document.getElementById(`play-${v.id}`);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              else navigate("/feed");
            };
            return (
              <button
                key={v.id}
                onClick={jump}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors text-left border-b border-border/60 last:border-b-0 group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-lg shrink-0 ${
                  isTop ? "bg-primary text-primary-foreground" : i === 1 ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors">{v.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{v.league} · {v.teams}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg" onClick={() => navigate("/leaderboard")} className="font-semibold">
            See full leaderboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardPreview;
