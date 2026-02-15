import { BookOpen, ExternalLink, Download } from "lucide-react";
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

interface RuleSection {
  ruleNumber: string;
  ruleTitle: string;
  ruleText: string;
  highlightedPart?: string;
}

export interface RulePanelProps {
  league?: string;
  season?: string;
  rules?: RuleSection[];
  keyInterpretation?: string;
  rulebookPdfUrl?: string;
}

const RulePanel = ({
  league = "NFL",
  season = "2014-15 Season",
  rules = [],
  keyInterpretation,
  rulebookPdfUrl,
}: RulePanelProps) => {

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
      {/* Compact header */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-accent" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Official Rulebook</div>
            <div className="text-xs text-muted-foreground">{league} {season}</div>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">{league}</Badge>
      </div>

      {/* Accordion rule content */}
      <div className="p-5">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="rulebook" className="border-none">
            <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
              Rulebook Explanation
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

                {/* Key interpretation */}
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

                {/* View full rule — opens Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="flex items-center gap-2 text-xs text-primary hover:underline mt-2 transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      View full rule in rulebook →
                    </button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-lg p-0">
                    <SheetHeader className="p-6 pb-4 border-b border-border">
                      <SheetTitle className="flex items-center gap-3 text-base">
                        <BookOpen className="w-4 h-4 text-accent" />
                        {league} Official Rulebook
                      </SheetTitle>
                      <p className="text-xs text-muted-foreground">{season}</p>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-140px)]">
                      <div className="p-6 space-y-8">
                        {rules.map((rule, i) => (
                          <div key={i}>
                            <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
                              {rule.ruleNumber}
                            </div>
                            <h3 className="text-lg font-semibold mb-3">{rule.ruleTitle}</h3>
                            <div className="p-5 rounded-xl bg-secondary/40 text-sm text-muted-foreground leading-relaxed">
                              {renderHighlightedText(rule.ruleText, rule.highlightedPart)}
                            </div>
                          </div>
                        ))}

                        {keyInterpretation && (
                          <div className="p-5 rounded-xl bg-accent/5 border border-accent/10">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                              <span className="text-xs font-medium text-accent">Key Interpretation</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {keyInterpretation}
                            </p>
                          </div>
                        )}

                        {/* Download PDF */}
                        {rulebookPdfUrl && (
                          <a
                            href={rulebookPdfUrl}
                            download
                            className="flex items-center gap-2 text-sm text-primary hover:underline transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download full rulebook (PDF)
                          </a>
                        )}
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default RulePanel;
