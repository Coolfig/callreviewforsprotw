import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import {
  ChevronRight, Zap, Scale, BookOpen, AlertCircle,
  FileText, TrendingUp, ArrowLeft, ArrowRight
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { getLeague, YEARS, LEAGUE_EMOJIS, LeagueKey } from "@/data/rulebookArchive";
import { SafeExternalLink, isValidExternalUrl } from "@/components/SafeExternalLink";

// ── Types ────────────────────────────────────────────────────────────────────
interface RuleChange {
  id: string;
  title: string;
  what_changed: string | null;
  previous_rule: string | null;
  impact: string | null;
  source_citation: string | null;
  source_url: string | null;
  sort_order: number;
}

interface RelatedReview {
  id: string;
  title: string;
  url: string;
  rule_tags: string[];
  verdict: string;
  teams: string | null;
  review_date: string | null;
  sort_order: number;
}

interface RuleYear {
  id: string;
  overview_summary: string | null;
  interpretation_notes: string | null;
}

// ── Verdict styling ───────────────────────────────────────────────────────────
const VERDICT_STYLES: Record<string, string> = {
  Correct:      "bg-success/10 text-success border-success/30",
  Missed:       "bg-destructive/10 text-destructive border-destructive/30",
  Questionable: "bg-secondary text-muted-foreground border-border",
  "50-50":      "bg-accent/10 text-accent-foreground border-accent/30",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <h2 className="text-lg font-bold">{title}</h2>
  </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────
const RulesYear = () => {
  const { league: leagueKey, year: yearStr } = useParams<{ league: string; year: string }>();
  const year = parseInt(yearStr ?? "0", 10);
  const league = getLeague(leagueKey ?? "");

  const [ruleYear, setRuleYear] = useState<RuleYear | null>(null);
  const [ruleChanges, setRuleChanges] = useState<RuleChange[]>([]);
  const [relatedReviews, setRelatedReviews] = useState<RelatedReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!league || !YEARS.includes(year)) return;

    const load = async () => {
      setLoading(true);

      // Fetch rule_year row
      const { data: ry } = await supabase
        .from("rule_years")
        .select("id, overview_summary, interpretation_notes")
        .eq("league", league.key)
        .eq("year", year)
        .maybeSingle();

      if (!ry) {
        setRuleYear(null);
        setRuleChanges([]);
        setRelatedReviews([]);
        setLoading(false);
        return;
      }

      setRuleYear(ry);

      // Parallel fetch changes + reviews
      const [changesRes, reviewsRes] = await Promise.all([
        supabase
          .from("rule_changes")
          .select("id, title, what_changed, previous_rule, impact, source_citation, source_url, sort_order")
          .eq("rule_year_id", ry.id)
          .order("sort_order"),
        supabase
          .from("rule_related_reviews")
          .select("id, title, url, rule_tags, verdict, teams, review_date, sort_order")
          .eq("rule_year_id", ry.id)
          .order("sort_order"),
      ]);

      setRuleChanges(changesRes.data ?? []);
      setRelatedReviews(reviewsRes.data ?? []);
      setLoading(false);
    };

    load();
  }, [league?.key, year]);

  if (!league || !YEARS.includes(year)) return <Navigate to="/rules" replace />;

  const prevYear = YEARS.includes(year - 1) ? year - 1 : null;
  const nextYear = YEARS.includes(year + 1) ? year + 1 : null;

  // ── SEO ─────────────────────────────────────────────────────────────────────
  const h1 = `${league.shortName} Rule Changes ${year}`;
  const title = `${league.shortName} Rule Changes ${year} – Interpretation & Analysis | CallReview`;
  const metaDesc =
    ruleYear?.overview_summary?.slice(0, 155) ??
    `${league.shortName} rule changes, officiating notes, and analysis for the ${year} season. Understand every key change and see how rules shaped controversial calls.`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Rules", item: "/rules" },
          { "@type": "ListItem", position: 2, name: league.shortName, item: `/rules/${league.key}` },
          { "@type": "ListItem", position: 3, name: String(year), item: `/rules/${league.key}/${year}` },
        ],
      },
      {
        "@type": "Article",
        headline: h1,
        description: metaDesc,
        about: { "@type": "SportsOrganization", name: league.name },
      },
    ],
  };

  // ── Other years for sidebar ──────────────────────────────────────────────────
  const nearbyYears = YEARS.filter((y) => y !== year).slice(0, 18);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={`/rules/${league.key}/${year}`} />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6 max-w-6xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap" aria-label="Breadcrumb">
              <Link to="/rules" className="hover:text-foreground transition-colors">Rules</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to={`/rules/${league.key}`} className="hover:text-foreground transition-colors">{league.shortName}</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">{year}</span>
            </nav>

            <div className="flex flex-col lg:flex-row gap-10">
              {/* ── MAIN CONTENT ── */}
              <div className="flex-1 min-w-0 space-y-12">

                {/* Title block */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{LEAGUE_EMOJIS[league.key as LeagueKey]}</span>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold">{h1}</h1>
                      <p className="text-sm text-muted-foreground">{league.name}</p>
                    </div>
                  </div>
                  {/* Prev / Next year nav */}
                  <div className="flex items-center gap-3 mt-4">
                    {prevYear ? (
                      <Link
                        to={`/rules/${league.key}/${prevYear}`}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> {prevYear}
                      </Link>
                    ) : <span />}
                    {nextYear && (
                      <Link
                        to={`/rules/${league.key}/${nextYear}`}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5"
                      >
                        {nextYear} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* ── Overview summary ── */}
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-secondary rounded w-3/4" />
                    <div className="h-4 bg-secondary rounded w-1/2" />
                  </div>
                ) : ruleYear?.overview_summary ? (
                  <section>
                    <SectionHeader icon={<TrendingUp className="w-4 h-4 text-primary" />} title="Season Overview" />
                    <div className="bg-card border border-border rounded-xl p-5">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {ruleYear.overview_summary}
                      </p>
                    </div>
                  </section>
                ) : null}

                {/* ── Key Rule Changes ── */}
                <section aria-labelledby="key-changes">
                  <SectionHeader
                    icon={<Zap className="w-4 h-4 text-primary" />}
                    title={`Key Rule Changes (${year})`}
                  />

                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                          <div className="h-4 bg-secondary rounded w-2/3 mb-2" />
                          <div className="h-3 bg-secondary rounded w-full" />
                        </div>
                      ))}
                    </div>
                  ) : ruleChanges.length > 0 ? (
                    <ul className="space-y-4">
                      {ruleChanges.map((change, i) => (
                        <li key={change.id} className="bg-card border border-border rounded-xl p-5">
                          <div className="flex gap-4">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0 space-y-3">
                              <p className="font-semibold text-sm">{change.title}</p>

                              {change.what_changed && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">What changed</p>
                                  <p className="text-sm text-foreground/90 leading-relaxed">{change.what_changed}</p>
                                </div>
                              )}

                              {change.previous_rule && (
                                <div className="bg-secondary/40 border border-border rounded-lg px-3 py-2">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Previous rule</p>
                                  <p className="text-xs text-muted-foreground leading-relaxed">{change.previous_rule}</p>
                                </div>
                              )}

                              {change.impact && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Impact</p>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{change.impact}</p>
                                </div>
                              )}

                              {(change.source_citation || isValidExternalUrl(change.source_url)) && (
                                <div className="flex items-center gap-2 pt-1">
                                  <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  {change.source_citation && (
                                    <span className="text-xs text-muted-foreground">{change.source_citation}</span>
                                  )}
                                  {isValidExternalUrl(change.source_url) && (
                                    <SafeExternalLink
                                      url={change.source_url}
                                      className="text-xs text-primary hover:underline"
                                    >
                                      View source →
                                    </SafeExternalLink>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
                      <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">
                        No rule changes curated yet for {league.shortName} {year}.
                      </p>
                      <SafeExternalLink
                        url={league.ruleChangesUrl}
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Check official {league.shortName} rule changes →
                      </SafeExternalLink>
                    </div>
                  )}
                </section>

                {/* ── Interpretation Notes ── */}
                {!loading && ruleYear?.interpretation_notes && (
                  <section>
                    <SectionHeader icon={<BookOpen className="w-4 h-4 text-primary" />} title="Interpretation Notes" />
                    <div className="bg-card border border-border rounded-xl p-5">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {ruleYear.interpretation_notes}
                      </p>
                    </div>
                  </section>
                )}

                {/* ── Notable Controversial Calls ── */}
                <section aria-labelledby="notable-calls">
                  <SectionHeader icon={<Scale className="w-4 h-4 text-primary" />} title="Notable Controversial Calls" />
                  {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse h-28" />
                      ))}
                    </div>
                  ) : relatedReviews.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {relatedReviews.map((review) => (
                        <Link
                          key={review.id}
                          to={review.url}
                          className="bg-card border border-border hover:border-primary/40 rounded-xl p-4 group transition-all block"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <p className="font-semibold text-sm group-hover:text-primary transition-colors leading-snug">
                              {review.title}
                            </p>
                            <span
                              className={`text-xs border rounded-full px-2 py-0.5 shrink-0 font-medium ${
                                VERDICT_STYLES[review.verdict] ?? "bg-secondary text-muted-foreground border-border"
                              }`}
                            >
                              {review.verdict}
                            </span>
                          </div>
                          {(review.teams || review.review_date) && (
                            <p className="text-xs text-muted-foreground mb-3">
                              {review.teams}
                              {review.teams && review.review_date ? " · " : ""}
                              {review.review_date}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {review.rule_tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-secondary/60 text-muted-foreground rounded-full px-2 py-0.5"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        No notable calls linked yet for {league.shortName} {year}.
                      </p>
                      <Link to="/feed" className="text-xs text-primary hover:underline mt-1 inline-block">
                        Browse all controversial calls →
                      </Link>
                    </div>
                  )}
                </section>
              </div>

              {/* ── SIDEBAR ── */}
              <aside className="lg:w-64 shrink-0 space-y-6">

                {/* Official source */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Official Source
                  </p>
                  <SafeExternalLink
                    url={league.officialRulesUrl}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                    showIcon
                  >
                    {league.shortName} Rulebook
                  </SafeExternalLink>
                  <SafeExternalLink
                    url={league.ruleChangesUrl}
                    className="flex items-center gap-2 text-sm text-primary hover:underline mt-2"
                    showIcon
                  >
                    Rule Changes History
                  </SafeExternalLink>
                </div>

                {/* Also link to rulebook archive */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Archive Snapshot
                  </p>
                  <Link
                    to={`/rulebooks/${league.key}/${year}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View {year} Rulebook Archive →
                  </Link>
                </div>

                {/* Jump to year */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Other Years — {league.shortName}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {nearbyYears.map((y) => (
                      <Link
                        key={y}
                        to={`/rules/${league.key}/${y}`}
                        className="text-center text-xs font-mono bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-md px-1.5 py-1.5 transition-all"
                      >
                        {y}
                      </Link>
                    ))}
                  </div>
                  <Link
                    to={`/rules/${league.key}`}
                    className="block text-center text-xs text-primary hover:underline mt-3"
                  >
                    All {league.shortName} years →
                  </Link>
                </div>

                {/* Browse other leagues */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Other Leagues
                  </p>
                  <div className="space-y-1.5">
                    {(["nfl", "nba", "nhl", "mlb"] as LeagueKey[])
                      .filter((k) => k !== league.key)
                      .map((k) => {
                        const l = getLeague(k)!;
                        return (
                          <Link
                            key={k}
                            to={`/rules/${k}/${year}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
                          >
                            <span>{LEAGUE_EMOJIS[k]}</span>
                            <span>{l.shortName} {year}</span>
                          </Link>
                        );
                      })}
                  </div>
                </div>
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
