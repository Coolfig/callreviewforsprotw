import { Send, Flame, Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToFeed = () => {
    const el = document.getElementById("feed");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else navigate("/feed");
  };


  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-16 bg-black">
      {/* Stadium gradient backdrop */}
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Stadium light sweeps */}
      <div className="absolute -top-40 left-1/4 w-[600px] h-[900px] bg-gradient-to-b from-primary/30 via-primary/5 to-transparent blur-3xl stadium-sweep origin-top" />
      <div
        className="absolute -top-40 right-1/4 w-[600px] h-[900px] bg-gradient-to-b from-info/25 via-info/5 to-transparent blur-3xl stadium-sweep origin-top"
        style={{ animationDelay: "-4s" }}
      />

      {/* Yellow accent glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] bg-accent/10 rounded-full blur-[140px]" />

      {/* Scoreboard ticker (top) */}
      <div className="absolute top-16 left-0 right-0 z-10 border-y border-border/40 bg-black/60 backdrop-blur-md overflow-hidden">
        <div className="flex items-center">
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-extrabold text-xs tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Live
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="marquee flex whitespace-nowrap py-2">
              {[...news, ...news].map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 text-sm font-medium inline-flex items-center gap-2 group hover:text-primary transition-colors"
                  title={item.headline}
                >
                  <span>{item.emoji}</span>
                  <span className="text-muted-foreground font-bold">{item.league}</span>
                  <span className="text-border">·</span>
                  <span className="text-foreground group-hover:text-primary transition-colors max-w-[420px] truncate">
                    {item.headline}
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                  <span className="ml-6 text-border">•</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-12">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/15 border border-primary/40">
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">The Sports Court</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/40">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-bold text-accent uppercase tracking-widest">{votes.toLocaleString()} votes cast</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 animate-slide-up leading-[0.9]">
            <span className="block text-foreground">YOU MAKE</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-info drop-shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
              THE CALL.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-slide-up font-medium"
            style={{ animationDelay: "0.1s" }}
          >
            The arena where fans review the most controversial plays in sports —
            <span className="text-foreground font-semibold"> vote, debate, and settle it with the rulebook.</span>
          </p>

          {/* CTA */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Button
              size="lg"
              className="text-base px-10 h-16 font-extrabold uppercase tracking-wider shadow-[0_10px_40px_-8px_hsl(var(--primary)/0.7)] hover:shadow-[0_15px_50px_-8px_hsl(var(--primary)/0.9)] hover:-translate-y-1 transition-all"
              onClick={scrollToFeed}
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Vote Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-10 h-16 font-extrabold uppercase tracking-wider border-2 border-accent/60 text-accent hover:bg-accent hover:text-accent-foreground transition-all"
              onClick={scrollToFeed}
            >
              <Send className="w-5 h-5 mr-2" />
              Submit a Call
            </Button>
          </div>

          {/* Live scoreboard stats */}
          <div
            className="grid grid-cols-3 gap-3 md:gap-6 max-w-3xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            {[
              { label: "Votes Cast", value: votes.toLocaleString(), color: "text-primary", icon: Vote },
              { label: "Calls Reviewed", value: calls.toLocaleString(), color: "text-accent", icon: TrendingUp },
              { label: "Active Debates", value: debates.toLocaleString(), color: "text-info", icon: Flame },
            ].map((stat) => (
              <div
                key={stat.label}
                className="relative group rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md p-4 md:p-5 hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground font-bold">
                    {stat.label}
                  </span>
                </div>
                <div className={`text-2xl md:text-4xl font-black tabular-nums ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in"
        style={{ animationDelay: "0.6s" }}
      >
        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
          Drop the puck
        </span>
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
          <div className="w-1.5 h-2.5 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
