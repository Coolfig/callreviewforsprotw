import { useState, useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Search, ExternalLink, ChevronRight, BookOpen } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getLeague, YEARS, LEAGUE_EMOJIS, LeagueKey } from "@/data/rulebookArchive";
import SafeExternalLink from "@/components/SafeExternalLink";

const DECADES = [
  { label: "2000s", years: YEARS.filter(y => y >= 2000 && y <= 2009) },
  { label: "2010s", years: YEARS.filter(y => y >= 2010 && y <= 2019) },
  { label: "2020s", years: YEARS.filter(y => y >= 2020 && y <= 2026) },
];

const RulebookLeague = () => {
  const { league: leagueKey } = useParams<{ league: string }>();
  const [search, setSearch] = useState("");
  const [activeDec, setActiveDec] = useState<string | null>(null);

  const league = getLeague(leagueKey ?? "");

  const filteredYears = useMemo(() => {
    let years = activeDec ? (DECADES.find(d => d.label === activeDec)?.years ?? YEARS) : YEARS;
    if (search.trim()) years = years.filter(y => String(y).includes(search.trim()));
    return years;
  }, [search, activeDec]);

  if (!league) return <Navigate to="/rulebooks" replace />;

  const hasData = (year: number) => {
    const yd = league.years[year];
    return yd && (yd.keyChanges.length > 0 || yd.relatedReviews.length > 0 || yd.yearSpecificPdfUrl);
  };

  const title = `${league.shortName} Rulebooks (2000–2026)`;
  const metaDesc = `Browse official ${league.name} rulebooks from 2000 to 2026. Find official PDF links, annual rule changes, and controversial calls analyzed by year.`;

  return (
    <>
      <title>{title} | CallReview</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={`/rulebooks/${league.key}`} />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Rulebooks", "item": "/rulebooks" },
          { "@type": "ListItem", "position": 2, "name": league.shortName, "item": `/rulebooks/${league.key}` },
        ],
      })}</script>

      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6 max-w-5xl">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
              <Link to="/rulebooks" className="hover:text-foreground transition-colors">Rulebooks</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">{league.shortName}</span>
            </nav>

            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end gap-6 justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{LEAGUE_EMOJIS[league.key as LeagueKey]}</span>
                  <div>
                    <h1 className="text-3xl font-bold">{title}</h1>
                    <p className="text-sm text-muted-foreground">{league.name}</p>
                  </div>
                </div>
                <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">{league.description}</p>
              </div>
                <div className="flex gap-3 shrink-0">
                  <SafeExternalLink
                    url={league.officialRulesUrl}
                    className="flex items-center gap-1.5 text-xs border border-border bg-card hover:bg-secondary px-3 py-2 rounded-lg transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Official Rules
                  </SafeExternalLink>
                  <SafeExternalLink
                    url={league.ruleChangesUrl}
                    className="flex items-center gap-1.5 text-xs border border-border bg-card hover:bg-secondary px-3 py-2 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Rule Changes
                  </SafeExternalLink>
                </div>
            </div>

            {/* Filters */}
            <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 py-3 mb-8 -mx-6 px-6">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Filter year…"
                    className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                {/* Decade tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveDec(null)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${!activeDec ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-secondary'}`}
                  >All</button>
                  {DECADES.map(d => (
                    <button
                      key={d.label}
                      onClick={() => setActiveDec(d.label === activeDec ? null : d.label)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${activeDec === d.label ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-secondary'}`}
                    >{d.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Year grid */}
            {filteredYears.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">No years match your filter.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredYears.map(year => {
                  const rich = hasData(year);
                  return (
                    <Link
                      key={year}
                      to={`/rulebooks/${league.key}/${year}`}
                      className={`group relative bg-card border rounded-xl p-4 hover:border-primary/50 hover:shadow-sm transition-all text-center ${rich ? 'border-primary/20' : 'border-border'}`}
                    >
                      {rich && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" title="Has curated content" />
                      )}
                      <p className="text-xl font-bold font-mono group-hover:text-primary transition-colors">{year}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rich ? "Curated" : "Official Link"}
                      </p>
                      <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary absolute bottom-3 right-3 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="mt-10 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                Years with curated rule changes & notable calls
              </span>
              <span>All years link to official sources.</span>
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default RulebookLeague;
