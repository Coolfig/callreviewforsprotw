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
  const [highlightVote, setHighlightVote] = useState(false);
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
    const feed = document.getElementById("feed");
    if (feed) {
      const top = window.scrollY + feed.getBoundingClientRect().top;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    } else {
      navigate("/feed");
    }
    setHighlightVote(true);
    window.setTimeout(() => setHighlightVote(false), 2200);
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

      <div className="container relative z-10 mx-auto max-w-full px-4 py-6 md:px-5 md:py-12">
        <div className="grid min-w-0 items-center gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
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

            <p className="mb-2 max-w-xl text-base font-medium text-muted-foreground md:text-lg">
              Under Review is where fans settle blown calls, hot takes, and sports debates.
            </p>

            <p className="mb-6 text-[11px] font-bold uppercase tracking-widest text-accent">
              Vote on legendary blown calls across NFL, NBA, MLB &amp; NHL
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

            {/* Top calls quick list — trimmed to 2 + "More calls" on mobile */}
            <div className="flex flex-wrap items-center justify-start gap-2">
              {topCalls.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => navigate(`/feed#play-${v.id}`)}
                  className={`basis-[calc(50%-0.25rem)] rounded-2xl border border-border/70 bg-card/60 px-3 py-2 text-center text-[11px] font-semibold leading-tight text-muted-foreground transition-colors hover:border-primary hover:text-primary md:basis-auto md:max-w-[220px] md:truncate md:rounded-full md:py-1.5 md:text-left ${i > 1 ? "hidden md:inline-block" : ""}`}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-primary md:hidden">{v.league}</span>
                  <span className="line-clamp-2 md:hidden">{v.title}</span>
                  <span className="hidden md:inline">{v.league} · {v.title}</span>
                </button>
              ))}
              <button
                onClick={scrollToFeed}
                className="basis-[calc(50%-0.25rem)] rounded-full border border-primary/50 bg-primary/10 px-3 py-1.5 text-center text-[11px] font-bold text-primary md:hidden"
              >
                More calls
              </button>
            </div>
          </div>



        </div>
      </div>
    </section>
  );
};

export default HeroSection;
