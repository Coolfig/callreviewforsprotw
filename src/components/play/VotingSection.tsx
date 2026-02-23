import { useState } from "react";
import { Check, X, HelpCircle, Users } from "lucide-react";

interface VotingSectionProps {
  totalVotes?: number;
  correctPercentage?: number;
  missedPercentage?: number;
  unclearPercentage?: number;
}

const VotingSection = ({
  totalVotes = 12847,
  correctPercentage = 38,
  missedPercentage = 48,
  unclearPercentage = 14,
}: VotingSectionProps) => {
  const [userVote, setUserVote] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(true);

  const handleVote = (vote: string) => {
    setUserVote(vote);
    setShowResults(true);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const votes = [
    {
      key: "correct",
      label: "Correct",
      icon: <Check className="w-5 h-5" />,
      pct: correctPercentage,
      activeClass: "bg-vote-correct text-white border-vote-correct",
      barClass: "bg-vote-correct",
      pctClass: "text-vote-correct",
      defaultClass: "border-border hover:bg-secondary text-foreground",
    },
    {
      key: "missed",
      label: "Missed",
      icon: <X className="w-5 h-5" />,
      pct: missedPercentage,
      activeClass: "bg-vote-missed text-white border-vote-missed",
      barClass: "bg-vote-missed",
      pctClass: "text-vote-missed",
      defaultClass: "border-border hover:bg-secondary text-foreground",
    },
    {
      key: "unclear",
      label: "Unclear",
      icon: <HelpCircle className="w-5 h-5" />,
      pct: unclearPercentage,
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
          <span>{formatNumber(totalVotes)} votes</span>
        </div>
      </div>

      {/* Vote buttons — 3 options only */}
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

      {/* Results bars */}
      {showResults && (
        <div className="space-y-3">
          {votes.map(({ key, label, pct, barClass, pctClass }) => (
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
          ))}
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
