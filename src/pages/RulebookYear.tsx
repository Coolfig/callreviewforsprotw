import { Link, useParams, Navigate } from "react-router-dom";
import {
  ExternalLink, ChevronRight, BookOpen, FileText,
  Archive, Zap, Scale, ListOrdered, AlertCircle, Loader2
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getLeague, getYearData, YEARS, LEAGUE_EMOJIS, LeagueKey, Verdict } from "@/data/rulebookArchive";
import { SafeExternalLink, isValidExternalUrl } from "@/components/SafeExternalLink";
import { useWaybackArchive } from "@/hooks/useWaybackArchive";

const VERDICT_STYLES: Record<Verdict, string> = {
  "Correct":      "bg-primary/10 text-primary border-primary/30",
  "Missed":       "bg-destructive/10 text-destructive border-destructive/30",
  "Questionable": "bg-secondary text-muted-foreground border-border",
  "50-50":        "bg-accent/10 text-accent-foreground border-accent/30",
};

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <h2 className="text-lg font-bold">{title}</h2>
  </div>
);

const RulebookYear = () => {
  const { league: leagueKey, year: yearStr } = useParams<{ league: string; year: string }>();
  const year = parseInt(yearStr ?? "0", 10);
  const league = getLeague(leagueKey ?? "");

  if (!league || !YEARS.includes(year)) return <Navigate to="/rulebooks" replace />;

  const yd = getYearData(league, year);
  const prevYear = YEARS.includes(year - 1) ? year - 1 : null;
  const nextYear = YEARS.includes(year + 1) ? year + 1 : null;

  // ── Archive resolution ──────────────────────────────────────────────────────
  const archive = useWaybackArchive({
    archivedPdfUrl:   yd.archivedPdfUrl,
    archivedYearUrl:  yd.archivedYearUrl,
    archiveTargetUrl: yd.archiveTargetUrl,
    officialRulesUrl: league.officialRulesUrl,
    year,
  });

  // The best archive link to show: PDF first, then year snapshot, then fallback
  const bestArchiveUrl = archive.archivedYearUrl ?? archive.fallbackArchivedUrl ?? null;
  const isFallback     = !archive.archivedYearUrl && !!archive.fallbackArchivedUrl;
  const hasPdf         = isValidExternalUrl(yd.yearSpecificPdfUrl);

  // ── SEO ────────────────────────────────────────────────────────────────────
  const h1        = `${league.shortName} Rulebook (${year})`;
  const title     = `${league.shortName} Rulebook ${year}: Official Links, Key Changes & Notable Calls`;
  const metaDesc  = `${league.shortName} official rulebook for ${year}. Archive snapshot, key rule changes, notable controversial calls, and quick rule reference guide.`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Rulebooks", "item": "/rulebooks" },
          { "@type": "ListItem", "position": 2, "name": league.shortName, "item": `/rulebooks/${league.key}` },
          { "@type": "ListItem", "position": 3, "name": String(year), "item": `/rulebooks/${league.key}/${year}` },
        ],
      },
      {
        "@type": "Article",
        "headline": h1,
        "description": metaDesc,
        "about": { "@type": "SportsOrganization", "name": league.name },
      },
    ],
  };

  return (
    <>
      <title>{title} | CallReview</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={`/rulebooks/${league.key}/${year}`} />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6 max-w-6xl">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap" aria-label="Breadcrumb">
              <Link to="/rulebooks" className="hover:text-foreground transition-colors">Rulebooks</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to={`/rulebooks/${league.key}`} className="hover:text-foreground transition-colors">{league.shortName}</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">{year}</span>
            </nav>

            <div className="flex flex-col lg:flex-row gap-10">
              {/* ─── MAIN CONTENT ─── */}
              <div className="flex-1 min-w-0 space-y-12">

                {/* Page title */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{LEAGUE_EMOJIS[league.key as LeagueKey]}</span>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold">{h1}</h1>
                      <p className="text-sm text-muted-foreground">{league.name}</p>
                    </div>
                  </div>
                </div>

                {/* ── Archive & Official Links ── */}
                <section aria-labelledby="official-links">
                  <SectionHeader icon={<Archive className="w-4 h-4 text-primary" />} title="Rulebook Links" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* ── PRIMARY: Archive Rulebook (year-specific) ── */}
                    {archive.loading ? (
                      <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 opacity-70">
                        <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Locating {year} archive snapshot…</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Checking Wayback Machine</p>
                        </div>
                      </div>
                    ) : bestArchiveUrl ? (
                      <SafeExternalLink
                        url={bestArchiveUrl}
                        className="flex items-start gap-3 bg-card border border-primary/30 hover:border-primary/60 rounded-xl p-4 transition-all group"
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Archive className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                            Archive Rulebook ({year})
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isFallback
                              ? "Closest available snapshot — Wayback Machine"
                              : yd.archivedPdfUrl
                                ? "Archived PDF — Wayback Machine"
                                : `Year-specific snapshot (${year}) — Wayback Machine`}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0 mt-0.5" />
                      </SafeExternalLink>
                    ) : (
                      <div className="flex items-start gap-3 bg-card border border-dashed border-border rounded-xl p-4">
                        <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                          <Archive className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">No archive snapshot found for {year}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Use the official source below</p>
                        </div>
                      </div>
                    )}

                    {/* Official rules portal — always present */}
                    <SafeExternalLink
                      url={yd.officialUrl ?? league.officialRulesUrl}
                      className="flex items-start gap-3 bg-card border border-border hover:border-primary/40 rounded-xl p-4 transition-all group"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold group-hover:text-primary transition-colors">Official Source</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{league.shortName} rules portal — current edition</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0 mt-0.5" />
                    </SafeExternalLink>

                    {/* Year-specific PDF from official domain — only if valid */}
                    {hasPdf && (
                      <SafeExternalLink
                        url={yd.yearSpecificPdfUrl}
                        className="flex items-start gap-3 bg-card border border-border hover:border-primary/40 rounded-xl p-4 transition-all group"
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold group-hover:text-primary transition-colors">Official {year} PDF</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Direct PDF from the official {league.shortName} domain</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0 mt-0.5" />
                      </SafeExternalLink>
                    )}
                  </div>

                  {/* Disclosure note */}
                  <p className="text-xs text-muted-foreground mt-3 pl-1">
                    Archive links open Wayback Machine snapshots captured during or near {year}. We do not host rulebook content — all links go to external sources.
                  </p>
                </section>

                {/* ── Key Rule Changes ── */}
                <section aria-labelledby="key-changes">
                  <SectionHeader icon={<Zap className="w-4 h-4 text-primary" />} title={`Key Rule Changes (${year})`} />
                  {yd.keyChanges.length > 0 ? (
                    <ul className="space-y-4">
                      {yd.keyChanges.map((change, i) => (
                        <li key={i} className="flex gap-4 bg-card border border-border rounded-xl p-4 group">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm mb-1">{change.title}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{change.summary}</p>
                            {isValidExternalUrl(change.sourceUrl) && (
                              <SafeExternalLink
                                url={change.sourceUrl}
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                              >
                                Source <ExternalLink className="w-3 h-3" />
                              </SafeExternalLink>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
                      <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">No curated rule changes yet for {year}.</p>
                      <SafeExternalLink
                        url={league.ruleChangesUrl}
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Check official {league.shortName} rule changes <ExternalLink className="w-3 h-3" />
                      </SafeExternalLink>
                    </div>
                  )}
                </section>

                {/* ── Notable Controversial Calls ── */}
                <section aria-labelledby="notable-calls">
                  <SectionHeader icon={<Scale className="w-4 h-4 text-primary" />} title="Notable Controversial Calls" />
                  {yd.relatedReviews.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {yd.relatedReviews.map((review, i) => (
                        <Link
                          key={i}
                          to={review.url}
                          className="bg-card border border-border hover:border-primary/40 rounded-xl p-4 group transition-all block"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <p className="font-semibold text-sm group-hover:text-primary transition-colors leading-snug">{review.title}</p>
                            <span className={`text-xs border rounded-full px-2 py-0.5 shrink-0 font-medium ${VERDICT_STYLES[review.verdict] ?? 'bg-secondary text-muted-foreground border-border'}`}>
                              {review.verdict}
                            </span>
                          </div>
                          {(review.teams || review.date) && (
                            <p className="text-xs text-muted-foreground mb-3">
                              {review.teams}{review.teams && review.date ? " · " : ""}{review.date}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {review.tags.map(tag => (
                              <span key={tag} className="text-xs bg-secondary/60 text-muted-foreground rounded-full px-2 py-0.5">{tag}</span>
                            ))}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
                      <p className="text-sm text-muted-foreground">No notable calls linked yet for {year}.</p>
                      <Link to="/feed" className="text-xs text-primary hover:underline mt-1 inline-block">
                        Browse all controversial calls →
                      </Link>
                    </div>
                  )}
                </section>

                {/* ── Quick Reference Table ── */}
                <section aria-labelledby="quick-ref">
                  <SectionHeader icon={<ListOrdered className="w-4 h-4 text-primary" />} title="Quick Reference" />
                  {yd.quickRefs.length > 0 ? (
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-secondary/30">
                            <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground w-2/5">Rule</th>
                            <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground">Quick Summary</th>
                            <th className="px-4 py-3 w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {yd.quickRefs.map((ref, i) => (
                            <tr key={i} className="hover:bg-secondary/20 transition-colors">
                              <td className="px-4 py-3 font-medium text-xs">{ref.rule}</td>
                              <td className="px-4 py-3 text-muted-foreground text-xs leading-relaxed">{ref.summary}</td>
                              <td className="px-4 py-3 text-center">
                                {isValidExternalUrl(ref.sourceUrl) && (
                                  <SafeExternalLink
                                    url={ref.sourceUrl}
                                    className="text-muted-foreground hover:text-primary transition-colors inline-flex"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </SafeExternalLink>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
                      <p className="text-sm text-muted-foreground">Quick reference rules will be added for {year} soon.</p>
                    </div>
                  )}
                </section>

              </div>

              {/* ─── SIDEBAR ─── */}
              <aside className="lg:w-64 shrink-0">
                <div className="sticky top-24 space-y-6">

                  {/* Jump to year */}
                  <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Jump to Year</h3>
                    <div className="grid grid-cols-3 gap-1">
                      {YEARS.map(y => (
                        <Link
                          key={y}
                          to={`/rulebooks/${league.key}/${y}`}
                          className={`text-xs font-mono text-center rounded px-1 py-1 transition-colors ${y === year ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
                        >
                          {y}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Prev / Next navigation */}
                  <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Navigate</h3>
                    {prevYear && (
                      <Link to={`/rulebooks/${league.key}/${prevYear}`}
                        className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                        ← {league.shortName} {prevYear}
                      </Link>
                    )}
                    {nextYear && (
                      <Link to={`/rulebooks/${league.key}/${nextYear}`}
                        className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                        {league.shortName} {nextYear} →
                      </Link>
                    )}
                    <Link to={`/rulebooks/${league.key}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-2 border-t border-border mt-2">
                      ↑ All {league.shortName} years
                    </Link>
                    <Link to="/rulebooks"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      ↑ Rulebook Hub
                    </Link>
                  </div>

                  {/* Official Source sidebar */}
                  <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Official Source</h3>
                    <SafeExternalLink
                      url={league.officialRulesUrl}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {league.shortName} Rules Portal
                    </SafeExternalLink>
                    {bestArchiveUrl && (
                      <SafeExternalLink
                        url={bestArchiveUrl}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        {isFallback ? "Closest Wayback Snapshot" : `${year} Archive`}
                      </SafeExternalLink>
                    )}
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

export default RulebookYear;
