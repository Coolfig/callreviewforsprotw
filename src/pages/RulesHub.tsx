import { Link } from "react-router-dom";
import { Scale, ChevronRight, BookOpen, TrendingUp, Users, Zap } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LEAGUE_KEYS, LEAGUE_EMOJIS, LEAGUES, YEARS } from "@/data/rulebookArchive";

const SAMPLE_YEARS = [2000, 2004, 2008, 2012, 2014, 2016, 2018, 2020, 2022, 2024, 2026];

const LEAGUE_HIGHLIGHTS: Record<string, { label: string; year: number }[]> = {
  nfl: [
    { label: "Catch Rule", year: 2014 },
    { label: "Fail Mary", year: 2012 },
    { label: "PI Reviewable", year: 2019 },
  ],
  nba: [
    { label: "Zone Defense", year: 2002 },
    { label: "Hand-Check", year: 2004 },
    { label: "Take Foul", year: 2023 },
  ],
  nhl: [
    { label: "Post-Lockout", year: 2005 },
    { label: "Coach's Challenge", year: 2016 },
    { label: "Video Review", year: 2014 },
  ],
  mlb: [
    { label: "Expanded Replay", year: 2014 },
    { label: "Pitch Clock", year: 2023 },
    { label: "Shift Ban", year: 2023 },
  ],
};

const RulesHub = () => {
  const title = "Sports Rule Interpretation & Change Database | CallReview";
  const metaDesc =
    "Browse NFL, NBA, NHL, and MLB rule changes and interpretations from 2000–2026. Understand what changed, why it matters, and how rulings shaped famous controversies.";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Sports Rule Interpretation Database",
    description: metaDesc,
    url: "/rules",
  };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href="/rules" />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          {/* ── Hero ── */}
          <section className="container mx-auto px-6 max-w-5xl mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-0.5">
                  CallReview Database
                </p>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                  Rule Interpretation & Change Database
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mb-8">
              Every major rule change across the NFL, NBA, NHL, and MLB — from 2000 to 2026. Understand
              what changed, the previous rule, real-world impact, and how specific calls were judged
              against the rules of <em>that season</em>.
            </p>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <Zap className="w-3.5 h-3.5" />, label: "Key rule changes per year" },
                { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "Interpretation notes" },
                { icon: <BookOpen className="w-3.5 h-3.5" />, label: "Source citations" },
                { icon: <Users className="w-3.5 h-3.5" />, label: "Linked controversial calls" },
              ].map(({ icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs bg-secondary/60 text-muted-foreground border border-border rounded-full px-3 py-1.5"
                >
                  {icon}
                  {label}
                </span>
              ))}
            </div>
          </section>

          {/* ── League cards ── */}
          <section className="container mx-auto px-6 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {LEAGUE_KEYS.map((key) => {
                const league = LEAGUES[key];
                const highlights = LEAGUE_HIGHLIGHTS[key] ?? [];
                const yearsWithData = Object.values(league.years).filter(
                  (yd) => yd.keyChanges.length > 0
                ).length;

                return (
                  <div
                    key={key}
                    className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5 hover:border-primary/30 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{LEAGUE_EMOJIS[key]}</span>
                        <div>
                          <h2 className="text-xl font-bold">{league.shortName}</h2>
                          <p className="text-xs text-muted-foreground">{league.name}</p>
                        </div>
                      </div>
                      <Link
                        to={`/rules/${key}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Browse all
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Year highlights */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
                        Notable Years
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {highlights.map(({ label, year }) => (
                          <Link
                            key={year}
                            to={`/rules/${key}/${year}`}
                            className="inline-flex items-center gap-1.5 text-xs bg-secondary/60 hover:bg-secondary text-foreground border border-border hover:border-primary/30 rounded-lg px-2.5 py-1.5 transition-all"
                          >
                            <span className="font-semibold">{year}</span>
                            <span className="text-muted-foreground">— {label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Year grid preview */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
                        Jump to Year
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {SAMPLE_YEARS.map((year) => (
                          <Link
                            key={year}
                            to={`/rules/${key}/${year}`}
                            className="text-xs bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-md px-2 py-1 transition-all font-mono"
                          >
                            {year}
                          </Link>
                        ))}
                        <Link
                          to={`/rules/${key}`}
                          className="text-xs text-primary hover:underline px-2 py-1"
                        >
                          all →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── How it works ── */}
          <section className="container mx-auto px-6 max-w-5xl mt-20">
            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="text-lg font-bold mb-4">How this database works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">Editable by season</p>
                  <p>Each league × year has its own interpretation notes, rule changes list, and linked controversial calls — added gradually over time.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Source-cited changes</p>
                  <p>Rule changes include the previous rule text, what changed, real-world impact, and an optional source citation from official league publications.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Linked to reviews</p>
                  <p>Each year page surfaces related Call Review debates so you can see exactly how that season's rules were applied in famous contested plays.</p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default RulesHub;
