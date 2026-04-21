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
          <div className="absolute inset-0 opacity-10"
               style={{
                 backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px),
                                   linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
                 backgroundSize: '32px 32px'
               }} />
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
