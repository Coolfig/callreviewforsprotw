import { BookOpen, ExternalLink, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RulePanelProps {
  league?: string;
  ruleNumber?: string;
  ruleTitle?: string;
  ruleText?: string;
  highlightedPart?: string;
}

const RulePanel = ({ 
  league = "NBA", 
  ruleNumber = "Rule 12B, Section II",
  ruleTitle = "Blocking Fouls",
  ruleText = "A blocking foul is committed when a defender impedes the progress of an offensive player who has the ball and who is moving in a legal manner. The defender must establish legal guarding position before contact occurs. Legal guarding position is established when the defender is facing the opponent with both feet on the floor.",
  highlightedPart = "establish legal guarding position before contact occurs"
}: RulePanelProps) => {
  // Split text to highlight the relevant part
  const parts = ruleText.split(highlightedPart);
  
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Official Rulebook</div>
            <div className="text-xs text-muted-foreground">{league} 2024-25 Season</div>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">{league}</Badge>
      </div>

      {/* Rule content */}
      <div className="p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {ruleNumber}
        </div>
        <h3 className="text-lg font-semibold mb-4">{ruleTitle}</h3>
        
        <div className="text-sm text-secondary-foreground leading-relaxed">
          {parts.length > 1 ? (
            <>
              {parts[0]}
              <span className="rule-highlight font-medium text-foreground">
                {highlightedPart}
              </span>
              {parts[1]}
            </>
          ) : (
            ruleText
          )}
        </div>

        {/* Additional context */}
        <div className="mt-6 p-4 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium text-accent">Key Interpretation</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The phrase "before contact occurs" is crucial. Officials must determine the exact moment 
            of contact and whether the defender had both feet planted at that instant.
          </p>
        </div>

        {/* Related rules */}
        <div className="mt-4">
          <button className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
            <span>Related Rules (3)</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Source link */}
        <a 
          href="#" 
          className="mt-4 flex items-center gap-2 text-xs text-primary hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          View full rule in official rulebook
        </a>
      </div>
    </div>
  );
};

export default RulePanel;
