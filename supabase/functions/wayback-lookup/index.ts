import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CdxRow {
  timestamp: string;
  original: string;
  statuscode: string;
}

interface WaybackResult {
  archivedYearUrl: string | null;
  fallbackArchivedUrl: string | null;
  source: "cdx" | "availability" | "none";
}

async function cdxLookup(targetUrl: string, year: number): Promise<WaybackResult> {
  const encoded = encodeURIComponent(targetUrl);
  const from = `${year}0101000000`;
  const to   = `${year}1231235959`;

  // ── 1. Try CDX for a capture inside the exact year ──────────────────────────
  const cdxUrl =
    `https://web.archive.org/cdx/search/cdx` +
    `?url=${encoded}` +
    `&from=${from}&to=${to}` +
    `&output=json&fl=timestamp,original,statuscode` +
    `&filter=statuscode:200&collapse=digest&limit=5`;

  try {
    const cdxRes = await fetch(cdxUrl, { headers: { "User-Agent": "CallReview/1.0" } });
    if (cdxRes.ok) {
      const rows: string[][] = await cdxRes.json();
      // rows[0] is the header ["timestamp","original","statuscode"]
      if (rows.length > 1) {
        // Pick the last capture in the year (most complete rulebook)
        const last = rows[rows.length - 1];
        const timestamp = last[0];
        const original  = last[1];
        return {
          archivedYearUrl: `https://web.archive.org/web/${timestamp}/${original}`,
          fallbackArchivedUrl: null,
          source: "cdx",
        };
      }
    }
  } catch {
    // fall through to availability check
  }

  // ── 2. Fallback: Wayback availability API (closest snapshot ever) ───────────
  const availUrl = `https://archive.org/wayback/available?url=${encoded}`;
  try {
    const avRes = await fetch(availUrl, { headers: { "User-Agent": "CallReview/1.0" } });
    if (avRes.ok) {
      const avJson = await avRes.json();
      const closest = avJson?.archived_snapshots?.closest;
      if (closest?.available && closest?.url) {
        return {
          archivedYearUrl: null,
          fallbackArchivedUrl: closest.url as string,
          source: "availability",
        };
      }
    }
  } catch {
    // nothing
  }

  return { archivedYearUrl: null, fallbackArchivedUrl: null, source: "none" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetUrl, year } = await req.json() as { targetUrl: string; year: number };

    if (!targetUrl || !year) {
      return new Response(
        JSON.stringify({ error: "targetUrl and year are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validate URL to prevent SSRF against internal services
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return new Response(
        JSON.stringify({ error: "Invalid URL protocol" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result = await cdxLookup(targetUrl, year);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
