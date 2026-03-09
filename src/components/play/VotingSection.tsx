import { useState, useEffect, useCallback } from "react";
import { Check, X, HelpCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface VotingSectionProps {
  playId: string;
  onVoteChange?: (totalVotes: number) => void;
}

const VotingSection = ({ playId, onVoteChange }: VotingSectionProps) => {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<string | null>(null);
  const [counts, setCounts] = useState({ correct: 0, missed: 0, unclear: 0 });
  const [loading, setLoading] = useState(true);

  const totalVotes = counts.correct + counts.missed + counts.unclear;

  const fetchVotes = useCallback(async () => {
    const { data, error } = await supabase
      .from("play_votes")
      .select("vote, user_id")
      .eq("play_id", playId);

    if (error) { console.error(error); return; }

    const c = { correct: 0, missed: 0, unclear: 0 };
    data?.forEach((v: any) => {
      if (v.vote in c) c[v.vote as keyof typeof c]++;
      if (user && v.user_id === user.id) setUserVote(v.vote);
    });
    setCounts(c);
    setLoading(false);
    onVoteChange?.(c.correct + c.missed + c.unclear);
  }, [playId, user, onVoteChange]);

  useEffect(() => { fetchVotes(); }, [fetchVotes]);

  const handleVote = async (vote: string) => {
    if (!user) {
      toast({ title: "Sign up to vote" });
      return;
    }

    const previousVote = userVote;
    
    // Optimistic update
    if (previousVote === vote) {
      // Remove vote
      setUserVote(null);
      setCounts(prev => ({ ...prev, [vote]: prev[vote as keyof typeof prev] - 1 }));
      await supabase.from("play_votes").delete().eq("user_id", user.id).eq("play_id", playId);
    } else {
      // Change or new vote
      setUserVote(vote);
      setCounts(prev => {
        const next = { ...prev, [vote]: prev[vote as keyof typeof prev] + 1 };
        if (previousVote) next[previousVote as keyof typeof next]--;
        return next;
      });

      if (previousVote) {
        await supabase.from("play_votes").update({ vote }).eq("user_id", user.id).eq("play_id", playId);
      } else {
        await supabase.from("play_votes").insert({ user_id: user.id, play_id: playId, vote });
      }
    }
  };

  const getPct = (key: string) => totalVotes === 0 ? 0 : Math.round((counts[key as keyof typeof counts] / totalVotes) * 100);

  const votes = [
    {
      key: "correct",
      label: "Correct",
      icon: <Check className="w-5 h-5" />,
      activeClass: "bg-vote-correct text-white border-vote-correct",
      barClass: "bg-vote-correct",
      pctClass: "text-vote-correct",
      defaultClass: "border-border hover:bg-secondary text-foreground",
    },
    {
      key: "missed",
      label: "Missed",
      icon: <X className="w-5 h-5" />,
      activeClass: "bg-vote-missed text-white border-vote-missed",
      barClass: "bg-vote-missed",
      pctClass: "text-vote-missed",
      defaultClass: "border-border hover:bg-secondary text-foreground",
    },
    {
      key: "unclear",
      label: "Unclear",
      icon: <HelpCircle className="w-5 h-5" />,
      activeClass: "bg-vote-unclear text-black border-vote-unclear",
      barClass: "bg-vote-unclear",
      pctClass: "text-vote-unclear",
      defaultClass: "border-border hover:bg-secondary text-foreground",
    },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-base">What's Your Call?</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>{totalVotes.toLocaleString()} votes</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {votes.map(({ key, label, icon, activeClass, defaultClass }) => (
          <button
            key={key}
            onClick={() => handleVote(key)}
            className={`flex flex-col items-center gap-2 py-4 rounded-xl border text-sm font-medium transition-all ${
              userVote === key ? activeClass : defaultClass
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {totalVotes > 0 && (
        <div className="space-y-3">
          {votes.map(({ key, label, barClass, pctClass }) => {
            const pct = getPct(key);
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{label} Call</span>
                  <span className={`font-semibold ${pctClass}`}>{pct}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barClass} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {userVote && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          You voted:{" "}
          <span className="font-semibold capitalize text-foreground">
            {votes.find((v) => v.key === userVote)?.label}
          </span>
        </p>
      )}
    </div>
  );
};

export default VotingSection;
