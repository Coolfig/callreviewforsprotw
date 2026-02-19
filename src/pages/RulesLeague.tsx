import { useState, useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ChevronRight, Search, BookOpen } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  getLeague,
  YEARS,
  LEAGUE_EMOJIS,
  LeagueKey,
} from "@/data/rulebookArchive";

const DECADES = [
  { label: "All", years: YEARS },
  { label: "2000s", years: YEARS.filter((y) => y >= 2000 && y <= 2009) },
  { label: "2010s", years: YEARS.filter((y) => y >= 2010 && y <= 2019) },
  { label: "2020s", years: YEARS.filter((y) => y >= 2020 && y <= 2026) },
];

const RulesLeague = () => {
  const { league: leagueKey } = useParams<{ league: string }>();
  const [search, setSearch] = useState("");
  const [activeDec, setActiveDec] = useState("All");

  const league = getLeague(leagueKey ?? "");

  const filteredYears = useMemo(() => {
    if (!league) return [];
    const decadeYears =
      DECADES.find((d) => d.label === activeDec)?.years ?? YEARS;
    return decadeYears.filter((y) =>
      search ? String(y).includes(search.trim()) : true
    );
  }, [search, activeDec, league]);

  if (!league) return <Navigate to="/rules" replace />;

  const hasData = (year: number) => {
    const yd = league.years[year];
    return yd && (yd.keyChanges.length > 0 || yd.relatedReviews.length > 0);
  };

  const title = `${league.shortName} Rule Changes & Interpretations (2000–2026)`;
  const metaDesc = `Browse ${league.shortName} rule changes, interpretations, and officiating notes from 2000 to 2026. Understand each season's rule context.`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Rules", item: "/rules" },
          {
            "@type": "ListItem",
            position: 2,
            name: league.shortName,
            item: `/rules/${league.key}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <title>{title} | CallReview</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={`/rules/${league.key}`} />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6 max-w-5xl">
            {/* Breadcrumb */}
            <nav
              className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap"
              aria-label="Breadcrumb"
            >
              <Link to="/rules" className="hover:text-foreground transition-colors">
                Rules
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">{league.shortName}</span>
            </nav>

            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
              <span className="text-4xl">{LEAGUE_EMOJIS[league.key as LeagueKey]}</span>
              <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                <p className="text-muted-foreground mt-1">{league.description}</p>
              </div>
            </div>

            {/* Sticky filters */}
            <div className="sticky top-16 z-10 bg-background/95 backdrop-blur border-b border-border pb-4 mb-8 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {DECADES.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => setActiveDec(d.label)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      activeDec === d.label
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find year…"
                  className="pl-9 pr-4 py-1.5 bg-secondary/40 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-32"
                />
              </div>
            </div>

            {/* Year grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
              {filteredYears.map((year) => {
                const curated = hasData(year);
                return (
                  <Link
                    key={year}
                    to={`/rules/${league.key}/${year}`}
                    className={`relative flex flex-col items-center justify-center rounded-xl p-3 text-sm font-mono font-semibold transition-all border group ${
                      curated
                        ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/60"
                        : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    {year}
                    {curated && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>

            {filteredYears.length === 0 && (
              <p className="text-center text-muted-foreground py-16">No years match your search.</p>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                Curated data available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-border inline-block" />
                Placeholder (can be filled in)
              </span>
            </div>

            {/* Official links */}
            <div className="mt-12 p-5 bg-card border border-border rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Official {league.shortName} rulebook</p>
                  <p className="text-xs text-muted-foreground">
                    Current rules from the official {league.name} source
                  </p>
                </div>
              </div>
              <a
                href={league.officialRulesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline shrink-0"
              >
                Visit official site →
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default RulesLeague;
