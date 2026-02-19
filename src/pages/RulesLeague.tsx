import { useState, useMemo, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ChevronRight, Search, BookOpen, TrendingUp, Flame, ChevronDown } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";

// ── League meta ───────────────────────────────────────────────────────────────
const LEAGUE_META: Record<string, {
  name: string; short: string; emoji: string;
  description: string; accent: string; accentBg: string; accentBorder: string;
  popularRules: string[]; debatedSeasons: { year: number; reason: string }[];
  officialRulesUrl: string; ruleChangesUrl: string;
}> = {
  nfl: {
    name: "National Football League", short: "NFL", emoji: "🏈",
    description: "NFL rule changes and officiating interpretations from 2000–2026. From the catch rule controversy to pass interference review, track how the NFL's rulebook evolved each season.",
    accent: "hsl(var(--primary))", accentBg: "hsl(var(--primary) / 0.08)", accentBorder: "hsl(var(--primary) / 0.25)",
    popularRules: ["Catch Rule", "Pass Interference", "Roughing the Passer", "Replay Review", "Taunting", "Helmet Contact", "Horse Collar", "Intentional Grounding"],
    debatedSeasons: [
      { year: 2012, reason: "Replacement referees & Fail Mary" },
      { year: 2014, reason: "Dez Bryant catch controversy" },
      { year: 2018, reason: "Catch rule simplified" },
      { year: 2019, reason: "PI became reviewable" },
      { year: 2022, reason: "Roughing the passer controversy" },
    ],
    officialRulesUrl: "https://operations.nfl.com/the-rules/nfl-rulebook/",
    ruleChangesUrl: "https://operations.nfl.com/the-rules/rule-changes/",
  },
  nba: {
    name: "National Basketball Association", short: "NBA", emoji: "🏀",
    description: "NBA rule changes and officiating interpretations from 2000–2026. From zone defense legalization to the take foul rule, see how the NBA's rulebook opened up the modern game.",
    accent: "hsl(24 95% 53%)", accentBg: "hsl(24 95% 53% / 0.08)", accentBorder: "hsl(24 95% 53% / 0.25)",
    popularRules: ["Defensive 3-Second", "Flagrant Foul", "Take Foul", "Challenge Rule", "Flopping", "Goaltending", "Clear Path Foul", "Zone Defense"],
    debatedSeasons: [
      { year: 2002, reason: "Zone defense legalized" },
      { year: 2004, reason: "Hand-check crackdown" },
      { year: 2016, reason: "Draymond Green suspension debate" },
      { year: 2020, reason: "Bubble officiating inconsistency" },
      { year: 2023, reason: "Take foul & flopping rules" },
    ],
    officialRulesUrl: "https://official.nba.com/rulebook/",
    ruleChangesUrl: "https://official.nba.com/rule-changes/",
  },
  nhl: {
    name: "National Hockey League", short: "NHL", emoji: "🏒",
    description: "NHL rule changes and officiating interpretations from 2000–2026. From the post-lockout era overhaul to goalie interference video review, track the evolution of hockey's rulebook.",
    accent: "hsl(213 94% 68%)", accentBg: "hsl(213 94% 68% / 0.08)", accentBorder: "hsl(213 94% 68% / 0.25)",
    popularRules: ["Offside Review", "Goalie Interference", "Icing", "Coach's Challenge", "Diving/Embellishment", "High-Sticking", "Delay of Game", "Shootout Rules"],
    debatedSeasons: [
      { year: 2005, reason: "Post-lockout rule overhaul" },
      { year: 2014, reason: "Expanded video review" },
      { year: 2016, reason: "Coach's Challenge introduced" },
      { year: 2019, reason: "Offside review controversies" },
      { year: 2021, reason: "Goalie interference call debates" },
    ],
    officialRulesUrl: "https://www.nhl.com/info/nhl-rulebook",
    ruleChangesUrl: "https://www.nhl.com/info/nhl-rulebook",
  },
  mlb: {
    name: "Major League Baseball", short: "MLB", emoji: "⚾",
    description: "MLB rule changes and officiating interpretations from 2000–2026. From expanded instant replay to the pitch clock era, understand how baseball's rulebook was modernized.",
    accent: "hsl(0 72% 51%)", accentBg: "hsl(0 72% 51% / 0.08)", accentBorder: "hsl(0 72% 51% / 0.25)",
    popularRules: ["Infield Fly Rule", "Instant Replay", "Pitch Clock", "Shift Rule", "Balk", "Manager Challenge", "Home Plate Collision", "Intentional Walk"],
    debatedSeasons: [
      { year: 2014, reason: "Expanded replay & home plate rule" },
      { year: 2019, reason: "Three-batter minimum" },
      { year: 2020, reason: "Universal DH introduced" },
      { year: 2023, reason: "Pitch clock, shift ban, larger bases" },
      { year: 2024, reason: "Pitch clock enforcement controversies" },
    ],
    officialRulesUrl: "https://www.mlb.com/official-information/official-rules",
    ruleChangesUrl: "https://www.mlb.com/official-information/official-rules",
  },
};

const RULE_CATEGORIES = [
  "All", "Officiating", "Replay / Challenge", "Safety", "Fouls / Penalties",
  "Scoring", "Equipment", "Catch / Control", "Out of Bounds", "Timing",
];

const DECADES = [
  { label: "All", from: 2000, to: 2026 },
  { label: "2000s", from: 2000, to: 2009 },
  { label: "2010s", from: 2010, to: 2019 },
  { label: "2020s", from: 2020, to: 2026 },
];

const ALL_YEARS = Array.from({ length: 27 }, (_, i) => 2000 + i);

// ── Component ─────────────────────────────────────────────────────────────────
const RulesLeague = () => {
  const { league: leagueKey } = useParams<{ league: string }>();
  const [search, setSearch] = useState("");
  const [activeDec, setActiveDec] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [yearsWithData, setYearsWithData] = useState<Set<number>>(new Set());

  const meta = leagueKey ? LEAGUE_META[leagueKey] : null;

  useEffect(() => {
    if (!leagueKey || !meta) return;
    // Step 1: get all rule_year ids for this league
    supabase
      .from("rule_years")
      .select("id, year")
      .eq("league", leagueKey)
      .then(({ data: ryRows }) => {
        if (!ryRows || ryRows.length === 0) return;
        const idToYear = new Map(ryRows.map((r) => [r.id, r.year]));
        const ids = Array.from(idToYear.keys());
        // Step 2: find which ids have rule_changes
        supabase
          .from("rule_changes")
          .select("rule_year_id")
          .in("rule_year_id", ids)
          .then(({ data: cd }) => {
            const withChanges = new Set<number>(
              (cd ?? [])
                .map((r) => idToYear.get(r.rule_year_id))
                .filter((y): y is number => y !== undefined)
            );
            setYearsWithData(withChanges);
          });
      });
  }, [leagueKey]);

  const filteredYears = useMemo(() => {
    const decade = DECADES.find((d) => d.label === activeDec);
    return ALL_YEARS.filter((y) => {
      const inDecade = decade ? y >= decade.from && y <= decade.to : true;
      const inSearch = search ? String(y).includes(search.trim()) : true;
      return inDecade && inSearch;
    });
  }, [search, activeDec]);

  if (!meta || !leagueKey) return <Navigate to="/rules" replace />;

  const title = `${meta.short} Rule Changes & Interpretations (2000–2026) | CallReview`;
  const metaDesc = meta.description;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "/" },
          { "@type": "ListItem", position: 2, name: "Rules", item: "/rules" },
          { "@type": "ListItem", position: 3, name: meta.short, item: `/rules/${leagueKey}` },
        ],
      },
    ],
  };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={`/rules/${leagueKey}`} />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6 max-w-6xl">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/rules" className="hover:text-foreground transition-colors">Rules</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">{meta.short}</span>
            </nav>

            {/* Page header */}
            <div className="flex items-start gap-4 mb-10">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                style={{ backgroundColor: meta.accentBg }}
              >
                {meta.emoji}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{meta.short} Rule Changes & Interpretations</h1>
                <p className="text-muted-foreground mt-1 max-w-2xl leading-relaxed">{meta.description}</p>
                <div className="flex gap-3 mt-3">
                  <a href={meta.officialRulesUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Official rulebook
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* ── MAIN CONTENT ── */}
              <div className="flex-1 min-w-0">

                {/* Sticky filter bar */}
                <div className="sticky top-16 z-10 bg-background/95 backdrop-blur border-b border-border pb-4 mb-6 space-y-3">
                  {/* Decade + search row */}
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div className="flex gap-1.5 flex-wrap">
                      {DECADES.map((d) => (
                        <button key={d.label} onClick={() => setActiveDec(d.label)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            activeDec === d.label
                              ? "text-primary-foreground"
                              : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                          }`}
                          style={activeDec === d.label ? { backgroundColor: meta.accent } : {}}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Find year…"
                        className="pl-9 pr-4 py-1.5 bg-secondary/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring w-28" />
                    </div>
                  </div>

                  {/* Category filter */}
                  <div className="flex flex-wrap gap-1.5">
                    {RULE_CATEGORIES.map((cat) => (
                      <button key={cat} onClick={() => setActiveCategory(cat)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                          activeCategory === cat
                            ? "border-transparent text-primary-foreground"
                            : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground bg-secondary/30"
                        }`}
                        style={activeCategory === cat ? { backgroundColor: meta.accent, borderColor: meta.accent } : {}}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2">
                  {filteredYears.map((year) => {
                    const hasCurated = yearsWithData.has(year);
                    return (
                      <Link key={year} to={`/rules/${leagueKey}/${year}`}
                        className="relative flex flex-col items-center justify-center rounded-xl p-3 text-sm font-mono font-semibold transition-all border"
                        style={hasCurated ? {
                          backgroundColor: meta.accentBg,
                          borderColor: meta.accentBorder,
                          color: meta.accent,
                        } : {}}
                        title={hasCurated ? `${meta.short} ${year} — curated content available` : `${meta.short} ${year}`}
                      >
                        <span className={!hasCurated ? "text-muted-foreground" : ""}>{year}</span>
                        {hasCurated && (
                          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: meta.accent }} />
                        )}
                      </Link>
                    );
                  })}
                </div>

                {filteredYears.length === 0 && (
                  <p className="text-center text-muted-foreground py-16">No years match your search.</p>
                )}

                {/* Legend */}
                <div className="flex items-center gap-4 mt-5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: meta.accent }} />
                    Curated rule changes available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-border inline-block" />
                    Placeholder (ready for content)
                  </span>
                </div>
              </div>

              {/* ── SIDEBAR ── */}
              <aside className="lg:w-64 shrink-0 space-y-5">

                {/* Popular rules */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold">Popular Rules</p>
                  </div>
                  <ul className="space-y-1.5">
                    {meta.popularRules.map((rule) => (
                      <li key={rule}>
                        <button
                          onClick={() => setActiveCategory(
                            RULE_CATEGORIES.find((c) => rule.toLowerCase().includes(c.toLowerCase())) ?? "All"
                          )}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left py-0.5 hover:pl-1"
                        >
                          {rule}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Most debated seasons */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold">Most Debated Seasons</p>
                  </div>
                  <ul className="space-y-2">
                    {meta.debatedSeasons.map(({ year, reason }) => (
                      <li key={year}>
                        <Link to={`/rules/${leagueKey}/${year}`}
                          className="group block rounded-lg p-2.5 hover:bg-secondary/60 transition-all">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-bold font-mono" style={{ color: meta.accent }}>{year}</span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                          </div>
                          <p className="text-xs text-muted-foreground leading-snug">{reason}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Other leagues */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Other Leagues
                  </p>
                  {(["nfl", "nba", "nhl", "mlb"] as const)
                    .filter((k) => k !== leagueKey)
                    .map((k) => {
                      const m = LEAGUE_META[k];
                      return (
                        <Link key={k} to={`/rules/${k}`}
                          className="flex items-center gap-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <span>{m.emoji}</span>
                          <span>{m.short} Rules</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                        </Link>
                      );
                    })}
                </div>

                {/* Hub link */}
                <Link to="/rules"
                  className="block bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
                  ← Back to all leagues
                </Link>
              </aside>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default RulesLeague;
