import { Send, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";

const SubmitCTA = () => {
  const scrollToFeed = () => document.getElementById("feed")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6 max-w-5xl">
        <div
          className="relative rounded-3xl border border-primary/30 p-10 md:p-16 text-center overflow-hidden"
          style={{ background: "var(--gradient-cta)" }}
        >
          {/* Sports balls background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
            {[
              { e: "🏈", t: "8%",  l: "4%",  s: "text-6xl", r: "-12deg", o: "opacity-20" },
              { e: "🏀", t: "62%", l: "10%", s: "text-7xl", r: "18deg",  o: "opacity-25" },
              { e: "⚾", t: "20%", l: "88%", s: "text-5xl", r: "10deg",  o: "opacity-20" },
              { e: "⚽", t: "72%", l: "82%", s: "text-7xl", r: "-20deg", o: "opacity-20" },
              { e: "🏒", t: "6%",  l: "46%", s: "text-5xl", r: "30deg",  o: "opacity-15" },
              { e: "🎾", t: "78%", l: "48%", s: "text-4xl", r: "-8deg",  o: "opacity-20" },
              { e: "🏐", t: "40%", l: "94%", s: "text-4xl", r: "12deg",  o: "opacity-15" },
              { e: "🥊", t: "44%", l: "2%",  s: "text-5xl", r: "-15deg", o: "opacity-15" },
            ].map((b, i) => (
              <span
                key={i}
                className={`absolute ${b.s} ${b.o} drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]`}
                style={{ top: b.t, left: b.l, transform: `rotate(${b.r})` }}
              >
                {b.e}
              </span>
            ))}
          </div>

          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-primary-foreground">
              See a blown call we missed?
            </h2>
            <p className="text-base md:text-lg text-primary-foreground/85 max-w-2xl mx-auto mb-8">
              Submit it to the community. We review every clip, pull the rule, and put it up for a vote.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                className="text-base px-8 h-14 font-bold bg-background text-foreground hover:bg-background/90"
                onClick={scrollToFeed}
              >
                <Send className="w-5 h-5 mr-2" />
                Submit a Call
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-base px-8 h-14 font-semibold text-primary-foreground hover:bg-primary-foreground/10"
                onClick={scrollToFeed}
              >
                <Vote className="w-5 h-5 mr-2" />
                Or vote on existing calls
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubmitCTA;
