import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

const SPORT_MAP: Record<string, string> = {
  nfl: 'football/nfl',
  nba: 'basketball/nba',
  mlb: 'baseball/mlb',
  nhl: 'hockey/nhl',
};

async function fetchWithRetry(url: string, retries = 3, delayMs = 500): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SportsApp/1.0)',
          'Accept': 'application/json',
        },
      });
      return res;
    } catch (err) {
      console.error(`Fetch attempt ${i + 1} failed for ${url}:`, err);
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw new Error('All fetch retries exhausted');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Authenticate caller
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const league = url.searchParams.get('league') || 'nba';
    const gameId = url.searchParams.get('gameId');
    const type = url.searchParams.get('type') || 'scoreboard';

    const sport = SPORT_MAP[league.toLowerCase()];
    if (!sport) {
      return new Response(JSON.stringify({ error: 'Invalid league' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let apiUrl: string;
    const athleteId = url.searchParams.get('athleteId');

    if (type === 'scoreboard') {
      apiUrl = `${ESPN_BASE}/${sport}/scoreboard`;
    } else if (type === 'summary' && gameId) {
      apiUrl = `${ESPN_BASE}/${sport}/summary?event=${gameId}`;
    } else if (type === 'standings') {
      apiUrl = `https://site.web.api.espn.com/apis/v2/sports/${sport}/standings?season=${url.searchParams.get('season') || new Date().getFullYear()}&type=0`;
    } else if (type === 'athlete' && athleteId) {
      const sportSegment = sport.split('/')[0];
      const leagueSegment = sport.split('/')[1];
      apiUrl = `https://site.web.api.espn.com/apis/common/v3/sports/${sportSegment}/${leagueSegment}/athletes/${athleteId}/overview`;
    } else {
      apiUrl = `${ESPN_BASE}/${sport}/scoreboard`;
    }

    const response = await fetchWithRetry(apiUrl);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Sports scores error:', message);
    // Return empty but valid structure so the UI doesn't break
    return new Response(JSON.stringify({ events: [], leagues: [], error: message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
