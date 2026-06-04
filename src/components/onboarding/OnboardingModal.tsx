import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Vote,
  MessageSquare,
  Trophy,
  Flame,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";

const STEPS = [
  {
    icon: Vote,
    title: "Make the Call",
    body: "Review controversial plays frame-by-frame and vote: Correct, Missed, or Unclear. Every vote shapes the verdict.",
    accent: "primary",
  },
  {
    icon: MessageSquare,
    title: "Debate with Evidence",
    body: "Post takes, drop GIFs, and back your arguments with the official rulebook — not emotion. Cite the clause, win the room.",
    accent: "info",
  },
  {
    icon: Trophy,
    title: "Climb the Leaderboard",
    body: "Earn +2 for every post, +1 for every like. Top 3 split a real $1,000 monthly prize pool. The cheers? Real too.",
    accent: "accent",
  },
  {
    icon: Flame,
    title: "You're in the Court",
    body: "Hit Vote Now to jump into today's hottest calls — or Submit a Call to put your own controversy on trial.",
    accent: "primary",
  },
];

const STORAGE_KEY = "onboarding_seen_v1";

const accentClasses: Record<string, { bg: string; ring: string; text: string }> = {
  primary: { bg: "bg-primary/15", ring: "ring-primary/40", text: "text-primary" },
  accent: { bg: "bg-accent/15", ring: "ring-accent/40", text: "text-accent" },
  info: { bg: "bg-info/15", ring: "ring-info/40", text: "text-info" },
};

const OnboardingModal = () => {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (loading || !user) return;
    const key = `${STORAGE_KEY}:${user.id}`;
    if (!localStorage.getItem(key)) {
      // Brief delay so the user lands first
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, [user, loading]);

  const close = () => {
    if (user) localStorage.setItem(`${STORAGE_KEY}:${user.id}`, "1");
    setOpen(false);
    setStep(0);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else close();
  };

  if (!user) return null;
  const current = STEPS[step];
  const Icon = current.icon;
  const a = accentClasses[current.accent];
  const isLast = step === STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-border/60 bg-card">
        {/* Header bar */}
        <div className="relative px-6 pt-5 pb-2 flex items-center justify-between border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Welcome to the Court
            </span>
          </div>
          <button
            onClick={close}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step visual */}
        <div className="px-8 pt-8 pb-2 text-center">
          <div
            className={`mx-auto w-20 h-20 rounded-2xl ${a.bg} ring-2 ${a.ring} flex items-center justify-center mb-5`}
          >
            <Icon className={`w-10 h-10 ${a.text}`} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
            {current.title}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            {current.body}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 py-5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-8 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-secondary/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (step === 0 ? close() : setStep(step - 1))}
            className="text-muted-foreground hover:text-foreground"
          >
            {step === 0 ? (
              "Skip tour"
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={next}
            className="font-bold uppercase tracking-wider px-5"
          >
            {isLast ? "Let's Go" : "Next"}
            {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
