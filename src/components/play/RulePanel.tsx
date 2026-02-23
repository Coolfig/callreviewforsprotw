import { BookOpen, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSeasonYear, type RuleExplanation } from "@/data/sportsVideos";

interface RuleSection {
  ruleNumber: string;
  ruleTitle: string;
  ruleText: string;
  highlightedPart?: string;
}

export interface RulePanelProps {
  league?: string;
  season?: string;
  playDate?: string;
  rules?: RuleSection[];
  keyInterpretation?: string;
  rulebookPdfUrl?: string;
  ruleExplanation?: RuleExplanation;
}

const RulePanel = ({
  league = "NFL",
  season,
  playDate,
  rules = [],
  keyInterpretation,
  ruleExplanation,
}: RulePanelProps) => {
  // Auto-calculate season if not provided
  const displaySeason = season || (playDate
    ? `${getSeasonYear(playDate, league)}-${String(getSeasonYear(playDate, league) + 1).slice(2)} Season`
    : undefined);

  const renderHighlightedText = (text: string, highlight?: string) => {
    if (!highlight) return <span>{text}</span>;
    const parts = text.split(highlight);
    if (parts.length <= 1) return <span>{text}</span>;
    return (
      <>
        {parts[0]}
        <strong className="text-foreground">{highlight}</strong>
        {parts[1]}
      </>
    );
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden h-full">
      {/* Header */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-accent" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Official Rulebook</div>
            {displaySeason && (
              <div className="text-xs text-muted-foreground">{league} {displaySeason}</div>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-xs">{league}</Badge>
      </div>

      {/* Content */}
      <div className="p-5">
        <Accordion type="single" collapsible defaultValue="explanation" className="w-full">

          {/* Rule Explanation — summary + bullet points */}
          {ruleExplanation && (
            <AccordionItem value="explanation" className="border-none">
              <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
                Rule Explanation
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-1">
                  {/* Reference */}
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    {ruleExplanation.ruleReference}
                  </div>

                  {/* Plain English Summary */}
                  <div className="p-4 rounded-xl bg-secondary/40">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Summary</div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {ruleExplanation.plainEnglishSummary}
                    </p>
                  </div>

                  {/* Key Requirements */}
                  <div>
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Key Requirements Officials Look For
                    </div>
                    <ul className="space-y-2">
                      {ruleExplanation.keyRequirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Interpretation Standard */}
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                    <div className="text-[11px] font-medium text-accent uppercase tracking-wider mb-2">
                      Interpretation Standard
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {ruleExplanation.interpretationStandard}
                    </p>
                  </div>

                  {/* Replay Standard */}
                  {ruleExplanation.replayStandard && (
                    <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Replay Standard
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {ruleExplanation.replayStandard}
                      </p>
                    </div>
                  )}

                  {/* Why This Call Was Made */}
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="text-[11px] font-medium text-primary uppercase tracking-wider mb-2">
                      Why This Call Was Made
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {ruleExplanation.whyCallWasMade}
                    </p>
                  </div>

                  {/* Key Rule Changes That Year */}
                  {ruleExplanation.keyRuleChanges && ruleExplanation.keyRuleChanges.length > 0 && (
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        Key Rule Changes
                      </div>
                      <ul className="space-y-1.5">
                        {ruleExplanation.keyRuleChanges.map((change, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Official Rule Text */}
          {rules.length > 0 && (
            <AccordionItem value="rulebook" className="border-none">
              <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
                Official Rule Text
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-5 pt-1">
                  {rules.map((rule, i) => (
                    <div key={i}>
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
                        {rule.ruleNumber}
                      </div>
                      <h4 className="text-sm font-semibold mb-2">{rule.ruleTitle}</h4>
                      <div className="p-4 rounded-xl bg-secondary/40 text-xs text-muted-foreground leading-relaxed">
                        {renderHighlightedText(rule.ruleText, rule.highlightedPart)}
                      </div>
                    </div>
                  ))}

                  {keyInterpretation && (
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-[11px] font-medium text-accent uppercase tracking-wider">Key Interpretation</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {keyInterpretation}
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>
  );
};

export default RulePanel;
