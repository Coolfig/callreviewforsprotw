import { useParams, Link, Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Seo from "@/components/seo/Seo";
import VideoPlayer from "@/components/play/VideoPlayer";
import RulePanel from "@/components/play/RulePanel";
import VotingSection from "@/components/play/VotingSection";
import CommentSection from "@/components/play/CommentSection";
import { Badge } from "@/components/ui/badge";
import { sportsVideos } from "@/data/sportsVideos";
import { findPlayBySlug, getPlayPath } from "@/lib/playSlug";

const SITE_URL = "https://undereview.com";

const CallDetail = () => {
  const { slug = "" } = useParams();
  const play = findPlayBySlug(slug);

  if (!play) return <Navigate to="/404" replace />;

  const path = getPlayPath(play);
  const ruleRef = play.ruleData?.rules?.[0];
  const title = `${play.title} — Was it the right call? | Under Review`.slice(0, 70);
  const description = `${play.league} · ${play.teams} · ${play.date}. ${
    ruleRef ? `${ruleRef.ruleNumber} — ${ruleRef.ruleTitle}. ` : ""
  }Watch the clip, read the rule, and vote on whether officials got it right.`.slice(0, 158);

  const related = sportsVideos
    .filter((v) => v.league === play.league && v.id !== play.id)
    .slice(0, 6);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: play.title,
      description: play.description,
      about: `${play.league} officiating`,
      articleSection: play.league,
      mainEntityOfPage: `${SITE_URL}${path}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Calls", item: `${SITE_URL}/calls` },
        { "@type": "ListItem", position: 3, name: play.title, item: `${SITE_URL}${path}` },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo title={title} description={description} path={path} jsonLd={jsonLd} />
      <Header />
      <main className="pt-[40px] md:pt-[112px]">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-1.5">/</span>
            <Link to="/calls" className="hover:text-foreground">Calls</Link>
          </nav>

          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{play.league}</Badge>
              <span className="text-xs text-muted-foreground">{play.teams}</span>
              <span className="text-xs text-muted-foreground">· {play.date}</span>
              <span className="text-xs text-muted-foreground">· {play.gameContext}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{play.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{play.description}</p>
          </header>

          <VideoPlayer
            embedUrl={play.embedUrl}
            videoUrl={play.videoUrl}
            source={play.videoSource}
          />

          <section aria-labelledby="vote-heading" className="space-y-3">
            <h2 id="vote-heading" className="text-lg font-semibold">What's your call?</h2>
            <VotingSection playId={play.id} />
          </section>

          {play.ruleData && (
            <section aria-labelledby="rule-heading" className="space-y-3">
              <h2 id="rule-heading" className="text-lg font-semibold">The rule, explained</h2>
              <RulePanel
                league={play.league}
                playDate={play.date}
                season={play.ruleData.season}
                rules={play.ruleData.rules}
                keyInterpretation={play.ruleData.keyInterpretation}
                rulebookPdfUrl={play.ruleData.rulebookPdfUrl}
                ruleExplanation={play.ruleData.ruleExplanation}
              />
            </section>
          )}

          <section aria-labelledby="discussion-heading" className="space-y-3">
            <h2 id="discussion-heading" className="text-lg font-semibold">Discussion</h2>
            <CommentSection playId={play.id} />
          </section>

          {related.length > 0 && (
            <section aria-labelledby="related-heading" className="space-y-3">
              <h2 id="related-heading" className="text-lg font-semibold">
                More {play.league} calls under review
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={getPlayPath(r)}
                      className="block rounded-lg border border-border p-3 text-sm hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium line-clamp-2">{r.title}</span>
                      <span className="block text-xs text-muted-foreground mt-1">{r.date}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CallDetail;
