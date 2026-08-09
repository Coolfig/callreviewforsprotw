import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Seo from "@/components/seo/Seo";
import { Badge } from "@/components/ui/badge";
import { sportsVideos } from "@/data/sportsVideos";
import { getPlayPath } from "@/lib/playSlug";

const SITE_URL = "https://undereview.com";
const LEAGUES = ["NFL", "NBA", "MLB", "NHL"];

const CallsIndex = () => {
  const description =
    "Every controversial call on Under Review — the clip, the rulebook text, and the fan verdict for blown calls across the NFL, NBA, MLB, and NHL.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Controversial Sports Calls",
    description,
    url: `${SITE_URL}/calls`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: sportsVideos.slice(0, 50).map((v, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: v.title,
        url: `${SITE_URL}${getPlayPath(v)}`,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Controversial Calls Archive | Under Review"
        description={description}
        path="/calls"
        jsonLd={jsonLd}
      />
      <Header />
      <main className="pt-[40px] md:pt-[112px]">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
          <header className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Controversial calls archive</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
          </header>

          {LEAGUES.map((league) => {
            const plays = sportsVideos.filter((v) => v.league === league);
            if (plays.length === 0) return null;
            return (
              <section key={league} className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="outline">{league}</Badge>
                  <span className="text-muted-foreground text-sm font-normal">
                    {plays.length} calls
                  </span>
                </h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {plays.map((p) => (
                    <li key={p.id}>
                      <Link
                        to={getPlayPath(p)}
                        className="block rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-medium text-sm line-clamp-2">{p.title}</span>
                        <span className="block text-xs text-muted-foreground mt-1">
                          {p.teams} · {p.date}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CallsIndex;
