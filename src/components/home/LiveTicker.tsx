import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  league: string;
  emoji: string;
  headline: string;
  link: string;
}

const FALLBACK_NEWS: NewsItem[] = [
  { league: "NFL", emoji: "🏈", headline: "Loading latest headlines…", link: "#" },
];

const LiveTicker = () => {
  const [news, setNews] = useState<NewsItem[]>(FALLBACK_NEWS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("sports-news", { body: {} });
        const items = (data as any)?.items as NewsItem[] | undefined;
        if (!cancelled && items && items.length) setNews(items);
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-12 border-b border-border/40 bg-black/95 backdrop-blur-md overflow-hidden">
      <div className="flex items-center h-full">
        <div className="flex-shrink-0 flex items-center justify-center gap-1 w-[60px] h-12 bg-primary text-primary-foreground font-bold text-xs uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Live
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="marquee flex whitespace-nowrap">
            {[...news, ...news].map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 text-xs font-medium inline-flex items-center gap-2 group hover:text-primary transition-colors cursor-pointer"
                title={item.headline}
              >
                <span>{item.emoji}</span>
                <span className="text-muted-foreground font-bold">{item.league}</span>
                <span className="text-border">·</span>
                <span className="text-foreground group-hover:text-primary transition-colors max-w-[420px] truncate underline-offset-4 group-hover:underline">
                  {item.headline}
                </span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                <span className="ml-6 text-border">•</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTicker;
