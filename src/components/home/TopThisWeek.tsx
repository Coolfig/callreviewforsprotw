import { Trophy, Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { sportsVideos } from "@/data/sportsVideos";
import refereeCharacter from "@/assets/referee-character.png";

const LEAGUE_DOT: Record<string, string> = {
  NFL: "bg-info",
  NBA: "bg-accent",
  MLB: "bg-primary",
  NHL: "bg-info",
};

const TopThisWeek = () => {
  const top = sportsVideos.slice(0, 3);
  const navigate = useNavigate();

  const jumpTo = (id: string) => {
    const el = document.getElementById(`play-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else navigate(`/feed#play-${id}`);
  };


  return (
    <section id="top-week" className="py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
           style={{
             backgroundImage: `radial-gradient(hsl(var(--primary)) 1px, transparent 1px)`,
             backgroundSize: '32px 32px'
           }} />
      <div className="container mx-auto px-6 max-w-7xl relative">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 mb-3">
              <Flame className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Top This Week</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              The calls everyone's <span className="text-primary">arguing about</span>
            </h2>
          </div>
          <Button
            variant="ghost"
            className="text-sm font-semibold hover:text-primary"
            onClick={() => document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" })}
          >
            View full feed
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {top.map((v, i) => (
            <button
              key={v.id}
              onClick={() => jumpTo(v.id)}
              className="group text-left bg-card rounded-2xl border border-border p-6 card-hover relative overflow-hidden"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
              <div className="flex items-start justify-between mb-4 relative">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${LEAGUE_DOT[v.league] || "bg-primary"}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{v.league}</span>
                </div>
                <div className="flex items-center gap-1 text-accent">
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">#{i + 1}</span>
                </div>
              </div>

              <div className="flex items-center justify-center mb-5 h-20">
                <img src={refereeCharacter} alt="" className="h-20 w-auto object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
              </div>

              <h3 className="font-bold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {v.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{v.teams} · {v.date}</p>

              <div className="flex items-center justify-between pt-4 border-t border-border/60">
                <span className="text-xs text-muted-foreground">Tap to weigh in</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-2 transition-all">
                  Vote
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopThisWeek;
