import { useEffect, useState } from "react";
import { Send, Flame, CheckCircle2, XCircle, HelpCircle, Users, ArrowRight, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sportsVideos } from "@/data/sportsVideos";

const VOTE_OPTIONS = [
  { label: "Correct", vote: "correct", icon: CheckCircle2 },
  { label: "Missed", vote: "missed", icon: XCircle },
  { label: "Unclear", vote: "unclear", icon: HelpCircle },
] as const;

const HeroSection = () => {
  const navigate = useNavigate();
  const featured = sportsVideos[0];
  const topCalls = sportsVideos.slice(0, 4);
  const [counts, setCounts] = useState<Record<string, number>>({ correct: 0, missed: 0, unclear: 0, total: 0 });

  const loadCounts = async () => {
    if (!featured) return;
    const { data } = await supabase.from("play_votes").select("vote").eq("play_id", featured.id);
    const next: Record<string, number> = { correct: 0, missed: 0, unclear: 0, total: 0 };
    (data ?? []).forEach((r: any) => {
      next[r.vote] = (next[r.vote] || 0) + 1;
      next.total += 1;
    });
    setCounts(next);
  };

  useEffect(() => { loadCounts(); /* eslint-disable-next-line */ }, []);

  const castVote = async (vote: string, label: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sign in to vote");
      navigate(`/auth?redirect=${encodeURIComponent("/#feed")}`);
      return;
    }
    const { error } = await supabase
      .from("play_votes")
      .upsert({ user_id: user.id, play_id: featured.id, vote }, { onConflict: "user_id,play_id" });
    if (error) toast.error(error.message || "Vote failed");
    else {
      toast.success(`Voted: ${label}`);
      loadCounts();
    }
  };

  const scrollToFeed = () => {
    const el = document.getElementById("feed");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else navigate("/feed");
  };

  const scrollToVote = () => {
    document.getElementById("hero-vote")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const MIN_VOTES_FOR_PCT = 10;
  const hasVotes = counts.total >= MIN_VOTES_FOR_PCT;
  const pct = (v: string) => (hasVotes ? Math.round(((counts[v] || 0) / counts.total) * 100) : 0);

  return (
    <section className="relative overflow-hidden bg-black">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: `repeating-linear-gradient(115deg, hsl(var(--foreground)) 0 2px, transparent 2px 90px)` }}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[320px] bg-accent/10 rounded-full blur-[140px]" />

      <div className="container relative z-10 mx-auto px-5 py-6 md:py-12">
        <div className="grid items-center gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
          {/* Left: identity + actions */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-3 py-1">
              <Flame className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">The Sports Court</span>
            </div>

            <h1 className="mb-3 text-4xl font-black leading-[0.95] tracking-tighter md:text-6xl">
              <span className="block text-foreground">YOU MAKE</span>
              <span className="block bg-gradient-to-r from-primary via-accent to-info bg-clip-text text-transparent">
                THE CALL.
              </span>
            </h1>

            <p className="mb-6 max-w-xl text-base font-medium text-muted-foreground md:text-lg">
              Under Review is where fans settle blown calls, hot takes, and sports debates.
            </p>

            <div className="mb-6 flex flex-wrap gap-3">
              <Button size="lg" className="h-12 px-6 font-extrabold uppercase tracking-wider" onClick={scrollToVote}>
                <Vote className="mr-2 h-4 w-4" />
                Vote Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 border-2 border-accent/60 px-6 font-extrabold uppercase tracking-wider text-accent hover:bg-accent hover:text-accent-foreground"
                onClick={scrollToFeed}
              >
                <Send className="mr-2 h-4 w-4" />
                Submit a Call
              </Button>
            </div>

            {/* Top calls quick list */}
            <div className="flex flex-wrap gap-2">
              {topCalls.map((v) => (
                <button
                  key={v.id}
                  onClick={() => navigate(`/feed#play-${v.id}`)}
                  className="max-w-[220px] truncate rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {v.league} · {v.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right: instant vote card */}
          {featured && (
            <div id="hero-vote" className="order-first rounded-2xl border border-border bg-card/80 p-5 backdrop-blur lg:order-none">
              <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary" /> Today's call · {featured.league}
              </div>
              <h2 className="mb-1 text-lg font-extrabold leading-snug text-foreground">{featured.title}</h2>
              <p className="mb-4 line-clamp-2 text-xs text-muted-foreground">{featured.description}</p>

              <div className="grid grid-cols-3 gap-2">
                {VOTE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.vote}
                      onClick={() => castVote(opt.vote, opt.label)}
                      className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background/50 py-3 text-xs font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Icon className="h-4 w-4" />
                      {opt.label}
                      {hasVotes && (
                        <span className="text-[10px] font-normal text-muted-foreground">{pct(opt.vote)}%</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {hasVotes ? `${counts.total.toLocaleString()} votes` : "Be the first to call it"}
                </span>
                <button onClick={scrollToFeed} className="flex items-center gap-1 font-semibold text-primary">
                  Open the debate <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
