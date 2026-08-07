import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LEAGUES: { key: string; label: string; emoji: string; path: string }[] = [
  { key: "nfl", label: "NFL", emoji: "🏈", path: "football/nfl" },
  { key: "nba", label: "NBA", emoji: "🏀", path: "basketball/nba" },
  { key: "mlb", label: "MLB", emoji: "⚾", path: "baseball/mlb" },
  { key: "nhl", label: "NHL", emoji: "🏒", path: "hockey/nhl" },
  { key: "soccer", label: "Soccer", emoji: "⚽", path: "soccer/eng.1" },
  { key: "mma", label: "UFC", emoji: "🥊", path: "mma/ufc" },
];

async function fetchLeague(league: typeof LEAGUES[number]) {
  try {
    const res = await fetch(
      `https://site.web.api.espn.com/apis/site/v2/sports/${league.path}/news?limit=4`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://www.espn.com/",
          Origin: "https://www.espn.com",
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const articles = Array.isArray(data?.articles) ? data.articles : [];
    return articles.slice(0, 3).map((a: any) => {
      const rawLink =
        a?.links?.web?.href ||
        a?.links?.mobile?.href ||
        "";
      // ESPN sometimes returns API self URLs; build a guaranteed-good story URL from id when possible.
      const id = a?.id || a?.dataSourceIdentifier;
      const fallback = id ? `https://www.espn.com/${league.path}/story/_/id/${id}` : "";
      const isUsableWebLink =
        rawLink && /^https?:\/\//.test(rawLink) && !rawLink.includes("site.api.espn.com");
      const link = isUsableWebLink ? rawLink : fallback || rawLink;
      return {
        league: league.label,
        emoji: league.emoji,
        headline: a?.headline || a?.title || "",
        link,
        published: a?.published || a?.lastModified || null,
      };
    }).filter((a: any) => a.headline && a.link);

  } catch (err) {
    console.error("news fetch failed", league.key, err);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const results = await Promise.all(LEAGUES.map(fetchLeague));
    // Interleave by league so the ticker mixes sports
    const max = Math.max(...results.map((r) => r.length));
    const items: any[] = [];
    for (let i = 0; i < max; i++) {
      for (const r of results) {
        if (r[i]) items.push(r[i]);
      }
    }
    return new Response(JSON.stringify({ items }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("sports-news error", message);
    return new Response(JSON.stringify({ items: [], error: message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
