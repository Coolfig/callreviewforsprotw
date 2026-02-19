import { Link } from "react-router-dom";
import { Scale, ChevronRight, Zap, FileText, TrendingUp, Users } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ── League config ─────────────────────────────────────────────────────────────
const LEAGUES = [
  {
    key: "nfl",
    emoji: "🏈",
    name: "National Football League",
    short: "NFL",
    accent: "hsl(var(--primary))",
    accentBg: "hsl(var(--primary) / 0.08)",
    accentBorder: "hsl(var(--primary) / 0.25)",
    description: "Pass interference, the catch rule, replay review standards, and player safety changes that defined modern football.",
    highlights: ["Catch Rule (2014)", "Fail Mary (2012)", "PI Reviewable (2019)", "Helmet Rule (2018)"],
    hotYears: [2012, 2014, 2015, 2018, 2019, 2022],
  },
  {
    key: "nba",
    emoji: "🏀",
    name: "National Basketball Association",
    short: "NBA",
    accent: "hsl(24 95% 53%)",
    accentBg: "hsl(24 95% 53% / 0.08)",
    accentBorder: "hsl(24 95% 53% / 0.25)",
    description: "Flopping penalties, take fouls, challenge rules, and the hand-check crackdown that opened the modern NBA.",
    highlights: ["Zone Defense (2002)", "Hand-Check (2004)", "Take Foul (2023)", "Coach's Challenge"],
    hotYears: [2002, 2004, 2016, 2020, 2023, 2024],
  },
  {
    key: "nhl",
    emoji: "🏒",
    name: "National Hockey League",
    short: "NHL",
    accent: "hsl(213 94% 68%)",
    accentBg: "hsl(213 94% 68% / 0.08)",
    accentBorder: "hsl(213 94% 68% / 0.25)",
    description: "Post-lockout rule overhaul, shootout introduction, goalie interference video review, and Coach's Challenge.",
    highlights: ["Post-Lockout (2005)", "Two-Line Pass", "Coach's Challenge (2016)", "Offside Review"],
    hotYears: [2005, 2014, 2016, 2019, 2021, 2024],
  },
  {
    key: "mlb",
    emoji: "⚾",
    name: "Major League Baseball",
    short: "MLB",
    accent: "hsl(0 72% 51%)",
    accentBg: "hsl(0 72% 51% / 0.08)",
    accentBorder: "hsl(0 72% 51% / 0.25)",
    description: "Expanded replay, pitch clock, shift ban, universal DH, and the home plate collision rule.",
    highlights: ["Expanded Replay (2014)", "Home Plate Rule", "Pitch Clock (2023)", "Shift Ban (2023)"],
    hotYears: [2014, 2020, 2022, 2023, 2024, 2026],
  },
] as const;

const STATS = [
  { label: "Leagues covered", value: "4" },
  { label: "Years tracked", value: "27" },
  { label: "Total pages", value: "108+" },
  { label: "Rule categories", value: "15+" },
];

const FEATURES = [
  { icon: <Zap className="w-4 h-4" />, title: "What changed", desc: "Plain-English breakdown of every rule change with the previous rule text for comparison." },
  { icon: <TrendingUp className="w-4 h-4" />, title: "Real-world impact", desc: "How each rule change affected gameplay, officiating patterns, and controversial outcomes." },
  { icon: <FileText className="w-4 h-4" />, title: "Source citations", desc: "Optional source field links each change to official league publications and rule books." },
  { icon: <Users className="w-4 h-4" />, title: "Linked to reviews", desc: "Related controversial calls from the CallReview feed are cross-referenced on every year page." },
];

const RulesHub = () => {
  const title = "Sports Rule Changes & Interpretations (2000–2026) | CallReview";
  const metaDesc =
    "Browse NFL, NBA, NHL, and MLB rule changes and officiating interpretations from 2000 to 2026. Understand what changed each season and how it shaped famous controversial calls.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href="/rules" />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Sports Rule Changes & Interpretations (2000–2026)",
        description: metaDesc,
        url: "/rules",
      })}</script>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-24">
          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <section className="container mx-auto px-6 max-w-5xl mb-20">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Scale className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                  CallReview Database
                </p>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                  Sports Rule Changes<br className="hidden sm:block" />
                  <span className="text-primary"> & Interpretations</span>
                </h1>
                <p className="text-lg text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                  Every major rule change across the NFL, NBA, NHL, and MLB — 2000 through 2026. Understand
                  what changed, why it mattered, and how specific controversial calls were judged under
                  the rules of <em>that exact season</em>.
                </p>
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
              {STATS.map(({ label, value }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── League cards ─────────────────────────────────────────────── */}
          <section className="container mx-auto px-6 max-w-5xl mb-20">
            <h2 className="text-xl font-bold mb-6">Browse by League</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {LEAGUES.map((league) => (
                <div
                  key={league.key}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:border-border/80 transition-all group"
                  style={{ borderColor: `hsl(var(--border))` }}
                >
                  {/* Accent top bar */}
                  <div className="h-1 w-full" style={{ backgroundColor: league.accent }} />

                  <div className="p-6 flex flex-col gap-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: league.accentBg }}
                        >
                          {league.emoji}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{league.short}</h3>
                          <p className="text-xs text-muted-foreground">{league.name}</p>
                        </div>
                      </div>
                      <Link
                        to={`/rules/${league.key}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                        style={{
                          backgroundColor: league.accentBg,
                          color: league.accent,
                          border: `1px solid ${league.accentBorder}`,
                        }}
                      >
                        Explore
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {league.description}
                    </p>

                    {/* Notable rules */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
                        Key topics
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {league.highlights.map((h) => (
                          <span
                            key={h}
                            className="text-xs rounded-full px-2.5 py-1 font-medium"
                            style={{
                              backgroundColor: league.accentBg,
                              color: league.accent,
                              border: `1px solid ${league.accentBorder}`,
                            }}
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Hot years */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
                        Notable seasons
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {league.hotYears.map((year) => (
                          <Link
                            key={year}
                            to={`/rules/${league.key}/${year}`}
                            className="text-xs font-mono bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-md px-2.5 py-1 transition-all"
                          >
                            {year}
                          </Link>
                        ))}
                        <Link
                          to={`/rules/${league.key}`}
                          className="text-xs font-mono text-muted-foreground hover:text-primary px-2.5 py-1 transition-all"
                        >
                          all →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Features ─────────────────────────────────────────────────── */}
          <section className="container mx-auto px-6 max-w-5xl mb-20">
            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-2">What's in each year page</h2>
              <p className="text-sm text-muted-foreground mb-7">
                Every season from 2000–2026 has a dedicated page ready for content.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {FEATURES.map(({ icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary mt-0.5">
                      {icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">{title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Quick jump grid ───────────────────────────────────────────── */}
          <section className="container mx-auto px-6 max-w-5xl">
            <h2 className="text-xl font-bold mb-6">Quick Year Jump</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {LEAGUES.map((league) => (
                <div key={league.key} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{league.emoji}</span>
                    <span className="font-semibold text-sm">{league.short}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {Array.from({ length: 27 }, (_, i) => 2000 + i).map((year) => (
                      <Link
                        key={year}
                        to={`/rules/${league.key}/${year}`}
                        className="text-center text-xs font-mono py-1 rounded hover:text-primary transition-colors text-muted-foreground"
                        title={`${league.short} ${year}`}
                      >
                        {String(year).slice(2)}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default RulesHub;
