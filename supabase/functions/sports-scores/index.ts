import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ESPN public API endpoints
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

const SPORT_MAP: Record<string, string> = {
  nfl: 'football/nfl',
  nba: 'basketball/nba',
  mlb: 'baseball/mlb',
  nhl: 'hockey/nhl',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    if (type === 'scoreboard') {
      apiUrl = `${ESPN_BASE}/${sport}/scoreboard`;
    } else if (type === 'summary' && gameId) {
      apiUrl = `${ESPN_BASE}/${sport}/summary?event=${gameId}`;
    } else {
      apiUrl = `${ESPN_BASE}/${sport}/scoreboard`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
