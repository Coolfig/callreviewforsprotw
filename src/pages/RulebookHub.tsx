import { Link } from "react-router-dom";
import { BookOpen, ExternalLink, ChevronRight, Archive } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LEAGUES, LEAGUE_KEYS, LEAGUE_EMOJIS, YEARS } from "@/data/rulebookArchive";
import SafeExternalLink from "@/components/SafeExternalLink";

const RulebookHub = () => {
  return (
    <>
      {/* SEO */}
      <title>Sports Rulebook Archive (2000–2026) | NFL, NBA, NHL, MLB | CallReview</title>
      <meta name="description" content="Browse official NFL, NBA, NHL, and MLB rulebooks from 2000 to 2026. Official links, key rule changes by year, and notable controversial calls analyzed." />
      <link rel="canonical" href="/rulebooks" />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Sports Rulebook Archive 2000–2026",
        "description": "Official NFL, NBA, NHL, and MLB rulebook links from 2000 to 2026.",
        "url": "https://callreviewforsprotw.lovable.app/rulebooks",
      })}</script>

      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-6 max-w-6xl">

            {/* Hero */}
            <div className="mb-16 max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Archive className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Archive</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Sports Rulebook<br />Archive
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Every league. Every year. Official sources only.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-border pl-4">
                This archive links directly to <strong className="text-foreground">official league sources</strong> — we do not host or re-distribute any rulebook PDFs. Where official year-specific PDFs aren't available, we link to the league's official rules portal and, where applicable, an archive.org snapshot as a backup.
              </p>
            </div>

            {/* League Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
              {LEAGUE_KEYS.map((key) => {
                const league = LEAGUES[key];
                return (
                  <div key={key} className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/30 transition-all">
                    {/* Card Header */}
                    <div className={`px-6 py-5 border-b border-border ${league.bgColor}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{LEAGUE_EMOJIS[key]}</span>
                          <div>
                            <h2 className={`text-xl font-bold ${league.color}`}>{league.shortName}</h2>
                            <p className="text-xs text-muted-foreground">{league.name}</p>
                          </div>
                        </div>
                        <Link
                          to={`/rulebooks/${key}`}
                          className="flex items-center gap-1.5 text-xs font-semibold bg-background/80 hover:bg-background border border-border px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Browse <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="px-6 py-5">
                      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{league.description}</p>

                      {/* Quick year grid preview */}
                      <div className="mb-5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Jump to year</p>
                        <div className="flex flex-wrap gap-1.5">
                          {YEARS.filter((_, i) => i % 4 === 0 || _ === 2026).map((year) => (
                            <Link
                              key={year}
                              to={`/rulebooks/${key}/${year}`}
                              className="text-xs font-mono bg-secondary/60 hover:bg-primary hover:text-primary-foreground rounded px-2 py-0.5 transition-colors"
                            >
                              {year}
                            </Link>
                          ))}
                          <Link to={`/rulebooks/${key}`} className="text-xs text-primary hover:underline px-2 py-0.5">
                            All years →
                          </Link>
                        </div>
                      </div>

                      {/* Official links */}
                      <div className="flex flex-wrap gap-3">
                        <SafeExternalLink
                          url={league.officialRulesUrl}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Official Rules Portal
                        </SafeExternalLink>
                        <SafeExternalLink
                          url={league.ruleChangesUrl}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Rule Changes
                        </SafeExternalLink>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* How it works */}
            <div className="border border-border rounded-2xl p-8 bg-card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                How This Archive Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-2">Official Sources Only</p>
                  <p>All rulebook links go directly to official league websites (NFL Operations, NBA.com, NHL.com, MLB.com). We never re-host or modify official documents.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-2">Archive.org Backups</p>
                  <p>For older years where official PDFs have been removed, we provide archive.org snapshot links as fallbacks so you can still access historical rules.</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-2">Curated Context</p>
                  <p>Each year page includes key rule changes, notable controversial calls from that season, and quick-reference tables for common rulings — with source links.</p>
                </div>
              </div>
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default RulebookHub;
