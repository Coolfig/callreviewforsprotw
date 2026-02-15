import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, BookOpen, Tag, ChevronRight, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";

interface Rule {
  id: string;
  rule_id: string;
  league: string;
  rule_number: string;
  title: string;
  plain_english_summary: string;
  official_text: string;
  tags: string[];
  example_play_ids: string[];
  season: string | null;
}

const leagueColors: Record<string, string> = {
  NFL: "bg-primary/10 text-primary border-primary/20",
  NBA: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  MLB: "bg-red-500/10 text-red-500 border-red-500/20",
  NHL: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const Rulebook = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedLeague, setSelectedLeague] = useState(searchParams.get("league") || "All");
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag") || "");
  const [expandedRule, setExpandedRule] = useState<string | null>(searchParams.get("rule") || null);

  const leagues = ["All", "NFL", "NBA", "MLB", "NHL"];

  useEffect(() => {
    const fetchRules = async () => {
      const { data, error } = await supabase.from("rules").select("*").order("league").order("rule_number");
      if (!error && data) setRules(data as Rule[]);
      setLoading(false);
    };
    fetchRules();
  }, []);

  // Get all unique tags
  const allTags = [...new Set(rules.flatMap(r => r.tags))].sort();

  const filtered = rules.filter(r => {
    if (selectedLeague !== "All" && r.league !== selectedLeague) return false;
    if (selectedTag && !r.tags.includes(selectedTag)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.rule_number.toLowerCase().includes(q) ||
        r.plain_english_summary.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q)) ||
        r.rule_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Rulebook</h1>
            </div>
            <p className="text-muted-foreground max-w-xl">
              Searchable, structured rules across all major sports leagues. Find the exact clause behind every controversial call.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search rules by name, number, or keyword…"
              className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* League filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {leagues.map(league => (
              <Badge
                key={league}
                variant={selectedLeague === league ? "default" : "outline"}
                className="cursor-pointer transition-all"
                onClick={() => setSelectedLeague(league)}
              >
                {league}
              </Badge>
            ))}
          </div>

          {/* Tag filter */}
          <div className="flex flex-wrap gap-1.5 mb-8">
            {selectedTag && (
              <Badge variant="secondary" className="cursor-pointer gap-1" onClick={() => setSelectedTag("")}>
                <Tag className="w-3 h-3" /> {selectedTag} ×
              </Badge>
            )}
            {!selectedTag && allTags.slice(0, 12).map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className="text-xs text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-full px-3 py-1 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Rules list */}
          {loading ? (
            <p className="text-center text-muted-foreground py-12">Loading rules…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No rules found matching your search.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map(rule => {
                const isExpanded = expandedRule === rule.rule_id;
                return (
                  <div
                    key={rule.id}
                    className="bg-card border border-border rounded-xl overflow-hidden transition-all"
                  >
                    {/* Rule header */}
                    <button
                      onClick={() => setExpandedRule(isExpanded ? null : rule.rule_id)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-xs ${leagueColors[rule.league] || ''}`}>
                            {rule.league}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">{rule.rule_id}</span>
                          {rule.season && (
                            <span className="text-xs text-muted-foreground">({rule.season})</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm">{rule.rule_number}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{rule.title}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                        {/* Plain English */}
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">In Plain English</h4>
                          <p className="text-sm leading-relaxed">{rule.plain_english_summary}</p>
                        </div>

                        {/* Official text */}
                        <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Official Rule Text</h4>
                          <p className="text-sm text-secondary-foreground leading-relaxed italic">
                            "{rule.official_text}"
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {rule.tags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => { setSelectedTag(tag); setExpandedRule(null); }}
                              className="text-xs bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-full px-2.5 py-0.5 transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>

                        {/* Example plays link */}
                        {rule.example_play_ids.length > 0 && (
                          <Link
                            to={`/feed#play-${rule.example_play_ids[0]}`}
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                          >
                            View example plays <ChevronRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Rulebook;
