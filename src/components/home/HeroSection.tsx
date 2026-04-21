import { Vote, Send, Flame } from "lucide-react";
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
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Accent glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-primary/15 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 mb-8 animate-fade-in">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">The Sports Debate Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 animate-slide-up leading-[1.05]">
            Vote on the Worst
            <br />
            <span className="text-gradient">Calls in Sports History</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Watch controversial plays frame-by-frame, weigh them against the official rulebook,
            and settle the debate with evidence — not just emotion.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button
              size="lg"
              className="text-base px-8 h-14 font-bold shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.6)] hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.8)] hover:-translate-y-0.5 transition-all"
              onClick={scrollToFeed}
            >
              <Vote className="w-5 h-5 mr-2" />
              Vote Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 h-14 font-semibold border-2 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
              onClick={scrollToFeed}
            >
              <Send className="w-5 h-5 mr-2" />
              Submit a Call
            </Button>
          </div>

          {/* Stat strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <span><span className="text-foreground font-bold text-base">100+</span> calls reviewed</span>
            <span className="hidden sm:inline text-border">|</span>
            <span><span className="text-foreground font-bold text-base">4</span> leagues covered</span>
            <span className="hidden sm:inline text-border">|</span>
            <span><span className="text-foreground font-bold text-base">Real</span> rulebook citations</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll to vote</span>
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
          <div className="w-1.5 h-2.5 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
