import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import {
  ChevronRight, Zap, Scale, AlertCircle,
  TrendingUp, ArrowLeft, ArrowRight, Tag
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { SafeExternalLink } from "@/components/SafeExternalLink";
import { getInterpretationNotes } from "@/data/interpretationNotes";
import { sportsVideos, getSeasonYear } from "@/data/sportsVideos";
// ── League meta (self-contained, no external deps) ───────────────────────────
const LEAGUE_META: Record<string, {
  name: string; short: string; emoji: string;
  accent: string; accentBg: string; accentBorder: string;
  officialRulesUrl: string; ruleChangesUrl: string;
}> = {
  nfl: {
    name: "National Football League", short: "NFL", emoji: "🏈",
    accent: "hsl(var(--primary))", accentBg: "hsl(var(--primary) / 0.08)", accentBorder: "hsl(var(--primary) / 0.25)",
    officialRulesUrl: "https://operations.nfl.com/the-rules/nfl-rulebook/",
    ruleChangesUrl: "https://operations.nfl.com/the-rules/rule-changes/",
  },
  nba: {
    name: "National Basketball Association", short: "NBA", emoji: "🏀",
    accent: "hsl(24 95% 53%)", accentBg: "hsl(24 95% 53% / 0.08)", accentBorder: "hsl(24 95% 53% / 0.25)",
    officialRulesUrl: "https://official.nba.com/rulebook/",
    ruleChangesUrl: "https://official.nba.com/rule-changes/",
  },
  nhl: {
    name: "National Hockey League", short: "NHL", emoji: "🏒",
    accent: "hsl(213 94% 68%)", accentBg: "hsl(213 94% 68% / 0.08)", accentBorder: "hsl(213 94% 68% / 0.25)",
    officialRulesUrl: "https://www.nhl.com/info/nhl-rulebook",
    ruleChangesUrl: "https://www.nhl.com/info/nhl-rulebook",
  },
  mlb: {
    name: "Major League Baseball", short: "MLB", emoji: "⚾",
    accent: "hsl(0 72% 51%)", accentBg: "hsl(0 72% 51% / 0.08)", accentBorder: "hsl(0 72% 51% / 0.25)",
    officialRulesUrl: "https://www.mlb.com/official-information/official-rules",
    ruleChangesUrl: "https://www.mlb.com/official-information/official-rules",
  },
};

const ALL_YEARS = Array.from({ length: 27 }, (_, i) => 2000 + i);

// ── DB types ─────────────────────────────────────────────────────────────────
interface RuleYear {
  id: string;
  overview_summary: string | null;
  interpretation_notes: string | null;
}


interface RelatedReview {
  id: string;
  title: string;
  url: string;
  rule_tags: string[];
  verdict: string;
  teams: string | null;
  review_date: string | null;
}

// ── Verdict styling ───────────────────────────────────────────────────────────
const VERDICT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Correct:      { bg: "hsl(var(--success) / 0.1)",      text: "hsl(var(--success))",      border: "hsl(var(--success) / 0.3)" },
  Missed:       { bg: "hsl(var(--destructive) / 0.1)",  text: "hsl(var(--destructive))",  border: "hsl(var(--destructive) / 0.3)" },
  Questionable: { bg: "hsl(var(--muted))",               text: "hsl(var(--muted-foreground))", border: "hsl(var(--border))" },
  "50-50":      { bg: "hsl(var(--accent) / 0.1)",        text: "hsl(var(--accent-foreground))", border: "hsl(var(--accent) / 0.3)" },
};

// ── Sub-components ────────────────────────────────────────────────────────────
const SectionHeader = ({
  icon, title, count,
}: { icon: React.ReactNode; title: string; count?: number }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <h2 className="text-lg font-bold">{title}</h2>
    {count !== undefined && count > 0 && (
      <span className="ml-auto text-xs bg-secondary text-muted-foreground rounded-full px-2 py-0.5">
        {count}
      </span>
    )}
  </div>
);

const PlaceholderCard = ({ message, sub }: { message: string; sub?: React.ReactNode }) => (
  <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
    <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
    <p className="text-sm text-muted-foreground mb-2">{message}</p>
    {sub}
  </div>
);

const TagPill = ({ tag, accent }: { tag: string; accent?: string }) => (
  <span
    className="text-xs rounded-full px-2.5 py-1 font-medium border"
    style={accent ? {
      backgroundColor: accent.replace(")", " / 0.1)").replace("hsl(", "hsl("),
      color: accent,
      borderColor: accent.replace(")", " / 0.3)").replace("hsl(", "hsl("),
    } : {}}
  >
    {tag}
  </span>
);

// ── Page ─────────────────────────────────────────────────────────────────────
const RulesYear = () => {
  const { league: leagueKey, year: yearStr } = useParams<{ league: string; year: string }>();
  const year = parseInt(yearStr ?? "0", 10);
  const meta = leagueKey ? LEAGUE_META[leagueKey] : null;

  const [ruleYear, setRuleYear] = useState<RuleYear | null>(null);
  const [relatedReviews, setRelatedReviews] = useState<RelatedReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!meta || !ALL_YEARS.includes(year)) return;
    const load = async () => {
      setLoading(true);
      const { data: ry } = await supabase
        .from("rule_years")
        .select("id, overview_summary, interpretation_notes")
        .eq("league", leagueKey!)
        .eq("year", year)
        .maybeSingle();

      setRuleYear(ry ?? null);
      if (!ry) { setLoading(false); return; }

      const reviewsRes = await supabase
        .from("rule_related_reviews")
        .select("id, title, url, rule_tags, verdict, teams, review_date, sort_order")
        .eq("rule_year_id", ry.id)
        .order("sort_order");

      setRelatedReviews(reviewsRes.data ?? []);
      setLoading(false);
    };
    load();
  }, [leagueKey, year]);

  if (!meta || !leagueKey || !ALL_YEARS.includes(year)) return <Navigate to="/rules" replace />;

  const prevYear = year > 2000 ? year - 1 : null;
  const nextYear = year < 2026 ? year + 1 : null;
  const nearbyYears = ALL_YEARS.filter((y) => y !== year);

  const allCategoryTags: string[] = [];

  // ── SEO ─────────────────────────────────────────────────────────────────────
  const h1 = `${meta.short} Rule Changes ${year}`;
  const pageTitle = `${meta.short} Rule Changes ${year} – Official Interpretation & Analysis | CallReview`;
  const metaDesc =
    ruleYear?.overview_summary
      ? ruleYear.overview_summary.slice(0, 155) + "…"
      : `${meta.short} rule changes and officiating interpretations for the ${year} season. Understand every key change, previous rule text, real-world impact, and related controversial calls.`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "/" },
          { "@type": "ListItem", position: 2, name: "Rules", item: "/rules" },
          { "@type": "ListItem", position: 3, name: meta.short, item: `/rules/${leagueKey}` },
          { "@type": "ListItem", position: 4, name: String(year), item: `/rules/${leagueKey}/${year}` },
        ],
      },
      {
        "@type": "Article",
        headline: h1,
        description: metaDesc,
        about: { "@type": "SportsOrganization", name: meta.name },
      },
    ],
  };

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={`/rules/${leagueKey}/${year}`} />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-24">
          <div className="container mx-auto px-6 max-w-6xl">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/rules" className="hover:text-foreground transition-colors">Rules</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to={`/rules/${leagueKey}`} className="hover:text-foreground transition-colors">{meta.short}</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">{year}</span>
            </nav>

            <div className="flex flex-col lg:flex-row gap-10">
              {/* ── MAIN CONTENT ── */}
              <div className="flex-1 min-w-0 space-y-12">

                {/* Title + year nav */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                      style={{ backgroundColor: meta.accentBg }}>
                      {meta.emoji}
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{h1}</h1>
                      <p className="text-sm text-muted-foreground mt-0.5">{meta.name} — {year} Season</p>
                    </div>
                  </div>

                  {/* Prev / Next */}
                  <div className="flex items-center gap-2 mt-2">
                    {prevYear ? (
                      <Link to={`/rules/${leagueKey}/${prevYear}`}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-all">
                        <ArrowLeft className="w-3.5 h-3.5" /> {prevYear}
                      </Link>
                    ) : null}
                    {nextYear ? (
                      <Link to={`/rules/${leagueKey}/${nextYear}`}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-all">
                        {nextYear} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : null}
                  </div>

                  {/* Category tags from this year */}
                  {allCategoryTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {allCategoryTags.map((tag) => (
                        <TagPill key={tag} tag={tag} accent={meta.accent} />
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Overview / Season Summary ── */}
                <section>
                  <SectionHeader icon={<TrendingUp className="w-4 h-4 text-primary" />} title="Season Overview" />
                  {loading ? (
                    <div className="bg-card border border-border rounded-xl p-5 animate-pulse space-y-2">
                      <div className="h-4 bg-secondary rounded w-full" />
                      <div className="h-4 bg-secondary rounded w-4/5" />
                      <div className="h-4 bg-secondary rounded w-3/5" />
                    </div>
                  ) : ruleYear?.overview_summary ? (
                    <div className="bg-card border border-border rounded-xl p-5">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {ruleYear.overview_summary}
                      </p>
                    </div>
                  ) : (
                    <PlaceholderCard
                      message={`No overview written yet for ${meta.short} ${year}.`}
                      sub={<span className="text-xs text-muted-foreground">Add via the admin panel.</span>}
                    />
                  )}
                </section>

                {/* ── Key Rule Changes ── */}
                <section>
                  {(() => {
                    const bullets = getInterpretationNotes(meta.short, year);
                    return (
                      <>
                        <SectionHeader
                          icon={<Zap className="w-4 h-4 text-primary" />}
                          title={`Key Rule Changes (${year})`}
                          count={bullets.length}
                        />
                        {bullets.length > 0 ? (
                          <div className="bg-card border border-border rounded-xl p-5">
                            <ul className="space-y-3">
                              {bullets.map((bullet, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <PlaceholderCard
                            message={`No rule changes curated yet for ${meta.short} ${year}.`}
                            sub={
                              <SafeExternalLink url={meta.ruleChangesUrl}
                                className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                                Check official {meta.short} rule changes →
                              </SafeExternalLink>
                            }
                          />
                        )}
                      </>
                    );
                  })()}
                </section>

                {/* ── Related Calls ── */}
                <section>
                  {(() => {
                    // Filter sportsVideos for this league and year
                    const relatedPlays = sportsVideos.filter((video) => {
                      if (video.league.toLowerCase() !== meta.short.toLowerCase()) return false;
                      const videoYear = getSeasonYear(video.date, video.league);
                      return videoYear === year;
                    });
                    return (
                      <>
                        <SectionHeader
                          icon={<Scale className="w-4 h-4 text-primary" />}
                          title="Related Calls"
                          count={relatedPlays.length}
                        />
                        {relatedPlays.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {relatedPlays.map((play) => (
                              <Link key={play.id} to={`/feed#play-${play.id}`}
                                className="bg-card border border-border hover:border-primary/40 rounded-xl p-4 group transition-all block">
                                <p className="font-semibold text-sm group-hover:text-primary transition-colors leading-snug mb-2">
                                  {play.title}
                                </p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {play.teams} · {play.date}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {play.description}
                                </p>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <PlaceholderCard
                            message={`No controversial calls catalogued yet for ${meta.short} ${year}.`}
                            sub={
                              <Link to="/feed" className="text-xs text-primary hover:underline inline-block mt-1">
                                Browse all controversial calls →
                              </Link>
                            }
                          />
                        )}
                      </>
                    );
                  })()}
                </section>

              </div>

              {/* ── SIDEBAR ── */}
              <aside className="lg:w-64 shrink-0 space-y-5">

                {/* Rule category tags from this page */}
                {allCategoryTags.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold">Rule Categories</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {allCategoryTags.map((tag) => (
                        <TagPill key={tag} tag={tag} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Jump to year */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Other Years — {meta.short}
                  </p>
                  <div className="grid grid-cols-4 gap-1">
                    {nearbyYears.map((y) => (
                      <Link key={y} to={`/rules/${leagueKey}/${y}`}
                        className="text-center text-xs font-mono py-1.5 rounded hover:text-primary transition-colors text-muted-foreground hover:bg-secondary/60">
                        {String(y).slice(2)}
                      </Link>
                    ))}
                  </div>
                  <Link to={`/rules/${leagueKey}`}
                    className="block text-center text-xs text-primary hover:underline mt-3">
                    All {meta.short} years →
                  </Link>
                </div>

                {/* Other leagues for same year */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Same Year — Other Leagues
                  </p>
                  {(["nfl", "nba", "nhl", "mlb"] as const)
                    .filter((k) => k !== leagueKey)
                    .map((k) => {
                      const m = LEAGUE_META[k];
                      return (
                        <Link key={k} to={`/rules/${k}/${year}`}
                          className="flex items-center gap-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <span>{m.emoji}</span>
                          <span>{m.short} {year}</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                        </Link>
                      );
                    })}
                </div>

                <Link to="/rules"
                  className="block bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
                  ← All leagues
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

export default RulesYear;
