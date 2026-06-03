import { useState } from "react";
import Header from "@/components/layout/Header";
import PostFeed from "@/components/post/PostFeed";
import { Scale } from "lucide-react";

const GROUPS = [
  { id: "all", label: "All", emoji: "🌐", keywords: [] as string[] },
  { id: "nfl", label: "NFL", emoji: "🏈", keywords: ["nfl", "football", "quarterback", "touchdown"] },
  { id: "nba", label: "NBA", emoji: "🏀", keywords: ["nba", "basketball", "lebron", "dunk"] },
  { id: "mlb", label: "MLB", emoji: "⚾", keywords: ["mlb", "baseball", "homerun", "pitcher"] },
  { id: "nhl", label: "NHL", emoji: "🏒", keywords: ["nhl", "hockey", "puck", "goalie"] },
  { id: "soccer", label: "Soccer", emoji: "⚽", keywords: ["soccer", "football", "fifa", "premier", "uefa", "messi", "ronaldo"] },
  { id: "ufc", label: "UFC / MMA", emoji: "🥊", keywords: ["ufc", "mma", "boxing", "knockout"] },
  { id: "college", label: "College", emoji: "🎓", keywords: ["ncaa", "college", "cfb", "cbb"] },
];

const Community = () => {
  const [active, setActive] = useState<string>("all");
  const group = GROUPS.find((g) => g.id === active)!;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto pt-20 px-4 pb-12">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Community</h1>
            <p className="text-xs text-muted-foreground">Share your sports opinions and hot takes</p>
          </div>
        </div>

        {/* Sport groups */}
        <div className="mb-5 -mx-1 px-1 overflow-x-auto subtle-scroll">
          <div className="flex gap-2 pb-2 min-w-max">
            {GROUPS.map((g) => {
              const isActive = active === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setActive(g.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 scale-105"
                      : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  <span>{g.emoji}</span>
                  <span>{g.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {active !== "all" && (
          <div className="mb-3 text-xs text-muted-foreground">
            Showing posts tagged <span className="font-bold text-foreground">#{group.label.toLowerCase()}</span>. Add{" "}
            <span className="font-mono font-bold text-primary">#{group.id}</span> to your post to appear here.
          </div>
        )}

        <PostFeed keywords={group.keywords} />
      </main>
    </div>
  );
};

export default Community;
