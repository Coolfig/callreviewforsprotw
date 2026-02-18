import { useState } from "react";
import { Check, X, HelpCircle, Users, ThumbsDown } from "lucide-react";

interface VotingSectionProps {
  totalVotes?: number;
  correctPercentage?: number;
  missedPercentage?: number;
  unclearPercentage?: number;
}

const VotingSection = ({
  totalVotes = 12847,
  correctPercentage = 34,
  missedPercentage = 52,
  unclearPercentage = 14,
}: VotingSectionProps) => {
  const [userVote, setUserVote] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(true);

  const handleVote = (vote: string) => {
    setUserVote(vote);
    setShowResults(true);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">What's Your Call?</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{formatNumber(totalVotes)} votes</span>
        </div>
      </div>

      {/* Vote buttons */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => handleVote('correct')}
          className={`vote-btn vote-btn-correct flex flex-col items-center gap-2 py-4 ${
            userVote === 'correct' ? 'bg-vote-correct text-white' : ''
          }`}
        >
          <Check className="w-6 h-6" />
          <span className="text-sm font-medium">Correct</span>
        </button>
        <button
          onClick={() => handleVote('missed')}
          className={`vote-btn vote-btn-missed flex flex-col items-center gap-2 py-4 ${
            userVote === 'missed' ? 'bg-vote-missed text-white' : ''
          }`}
        >
          <X className="w-6 h-6" />
          <span className="text-sm font-medium">Missed</span>
        </button>
        <button
          onClick={() => handleVote('dislike')}
          className={`vote-btn flex flex-col items-center gap-2 py-4 rounded-lg border border-border transition-all ${
            userVote === 'dislike' ? 'bg-destructive text-white border-destructive' : 'hover:bg-secondary'
          }`}
        >
          <ThumbsDown className="w-6 h-6" />
          <span className="text-sm font-medium">Dislike</span>
        </button>
        <button
          onClick={() => handleVote('unclear')}
          className={`vote-btn vote-btn-unclear flex flex-col items-center gap-2 py-4 ${
            userVote === 'unclear' ? 'bg-vote-unclear text-black' : ''
          }`}
        >
          <HelpCircle className="w-6 h-6" />
          <span className="text-sm font-medium">Unclear</span>
        </button>
      </div>

      {/* Results */}
      {showResults && (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Correct Call</span>
              <span className="font-medium text-vote-correct">{correctPercentage}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-vote-correct rounded-full transition-all duration-500"
                style={{ width: `${correctPercentage}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Missed Call</span>
              <span className="font-medium text-vote-missed">{missedPercentage}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-vote-missed rounded-full transition-all duration-500"
                style={{ width: `${missedPercentage}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Unclear</span>
              <span className="font-medium text-vote-unclear">{unclearPercentage}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-vote-unclear rounded-full transition-all duration-500"
                style={{ width: `${unclearPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {userVote && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          You voted: <span className="font-medium capitalize">{userVote === 'correct' ? 'Correct Call' : userVote === 'missed' ? 'Missed Call' : 'Unclear'}</span>
        </p>
      )}
    </div>
  );
};

export default VotingSection;
