import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentToVerify {
  url: string;
  title?: string;
  description?: string;
  caption?: string;
  platform: 'youtube' | 'x' | 'tiktok' | 'instagram' | 'reddit';
}

interface VerificationResult {
  url: string;
  is_valid: boolean;
  sports_signals: {
    teams_found: string[];
    leagues_found: string[];
    rule_keywords_found: string[];
  };
  rejection_signals: {
    meme_keywords: string[];
    music_signals: string[];
    entertainment_signals: string[];
    spam_signals: string[];
  };
  rejection_reason: string | null;
  confidence_score: number;
}

// Normalize text for matching
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/['']/g, "'").replace(/[""]/g, '"');
}

// Check if keyword exists in text (word boundary aware)
function containsKeyword(text: string, keyword: string): boolean {
  const normalizedText = normalizeText(text);
  const normalizedKeyword = normalizeText(keyword);
  
  const escapedKeyword = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
  
  return pattern.test(normalizedText);
}

// Find all matching keywords from a list
function findMatchingKeywords(text: string, keywords: string[]): string[] {
  const matches: string[] = [];
  for (const keyword of keywords) {
    if (containsKeyword(text, keyword)) {
      matches.push(keyword);
    }
  }
  return matches;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { content }: { content: ContentToVerify[] } = await req.json();
    
    if (!content || !Array.isArray(content) || content.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No content provided for verification' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Verifying ${content.length} content items`);
    
    // Fetch content filters (meme/spam blacklist)
    const { data: filters, error: filtersError } = await supabase
      .from('content_filters')
      .select('filter_type, keywords')
      .eq('is_active', true);
    
    if (filtersError) {
      console.error('Error fetching content filters:', filtersError);
      throw new Error('Failed to fetch content filters');
    }
    
    // Organize filters by type
    const filtersByType: Record<string, string[]> = {};
    for (const filter of filters || []) {
      filtersByType[filter.filter_type] = filter.keywords;
    }
    
    // Fetch team mappings for sports verification
    const { data: teams, error: teamsError } = await supabase
      .from('team_mappings')
      .select('league, team_name, aliases')
      .eq('is_active', true);
    
    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      throw new Error('Failed to fetch team mappings');
    }
    
    // Fetch keyword buckets for rule keywords
    const { data: buckets, error: bucketsError } = await supabase
      .from('keyword_buckets')
      .select('bucket_name, keywords, league')
      .eq('is_active', true);
    
    if (bucketsError) {
      console.error('Error fetching buckets:', bucketsError);
      throw new Error('Failed to fetch keyword buckets');
    }
    
    // Extract all rule keywords from buckets
    const allRuleKeywords: string[] = [];
    for (const bucket of buckets || []) {
      if (bucket.bucket_name.startsWith('rule_')) {
        allRuleKeywords.push(...bucket.keywords);
      }
    }
    
    // League names for detection
    const leagueNames = ['NFL', 'NBA', 'MLB', 'NHL', 'MLS', 'NCAA', 'WNBA', 'PGA', 'UFC', 'WWE', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1'];
    
    const results: VerificationResult[] = [];
    
    for (const item of content) {
      // Combine all text fields for analysis
      const fullText = [
        item.title || '',
        item.description || '',
        item.caption || '',
        item.url || ''
      ].join(' ');
      
      // Find sports signals
      const teamsFound: string[] = [];
      const leaguesFound: string[] = [];
      
      for (const team of teams || []) {
        for (const alias of team.aliases) {
          if (containsKeyword(fullText, alias)) {
            if (!teamsFound.includes(team.team_name)) {
              teamsFound.push(team.team_name);
            }
            if (!leaguesFound.includes(team.league)) {
              leaguesFound.push(team.league);
            }
            break;
          }
        }
        if (containsKeyword(fullText, team.team_name)) {
          if (!teamsFound.includes(team.team_name)) {
            teamsFound.push(team.team_name);
          }
          if (!leaguesFound.includes(team.league)) {
            leaguesFound.push(team.league);
          }
        }
      }
      
      // Check for league names directly
      for (const league of leagueNames) {
        if (containsKeyword(fullText, league) && !leaguesFound.includes(league)) {
          leaguesFound.push(league);
        }
      }
      
      const ruleKeywordsFound = findMatchingKeywords(fullText, allRuleKeywords);
      
      // Find rejection signals
      const memeKeywords = findMatchingKeywords(fullText, filtersByType['meme'] || []);
      const musicSignals = findMatchingKeywords(fullText, filtersByType['music_artist'] || []);
      const entertainmentSignals = findMatchingKeywords(fullText, filtersByType['entertainment'] || []);
      const spamSignals = findMatchingKeywords(fullText, filtersByType['spam'] || []);
      
      // Calculate scores
      const sportsScore = teamsFound.length * 3 + leaguesFound.length * 2 + ruleKeywordsFound.length;
      const rejectionScore = memeKeywords.length * 2 + musicSignals.length * 3 + entertainmentSignals.length * 2 + spamSignals.length;
      
      // Determine validity
      let isValid = true;
      let rejectionReason: string | null = null;
      
      // Reject if: strong rejection signals present
      if (musicSignals.length > 0) {
        isValid = false;
        rejectionReason = `Music/meme content detected: ${musicSignals.slice(0, 3).join(', ')}`;
      } else if (memeKeywords.length >= 2) {
        isValid = false;
        rejectionReason = `Meme content detected: ${memeKeywords.slice(0, 3).join(', ')}`;
      } else if (entertainmentSignals.length >= 2 && sportsScore === 0) {
        isValid = false;
        rejectionReason = `Non-sports entertainment: ${entertainmentSignals.slice(0, 3).join(', ')}`;
      } else if (spamSignals.length >= 2) {
        isValid = false;
        rejectionReason = `Spam signals detected: ${spamSignals.slice(0, 3).join(', ')}`;
      }
      // Also reject if no sports signals at all
      else if (sportsScore === 0) {
        isValid = false;
        rejectionReason = 'No sports-related content detected';
      }
      
      // Calculate confidence score (0-100)
      const confidenceScore = isValid 
        ? Math.min(100, 50 + sportsScore * 10 - rejectionScore * 5)
        : Math.max(0, 50 - rejectionScore * 10);
      
      results.push({
        url: item.url,
        is_valid: isValid,
        sports_signals: {
          teams_found: teamsFound,
          leagues_found: leaguesFound,
          rule_keywords_found: ruleKeywordsFound,
        },
        rejection_signals: {
          meme_keywords: memeKeywords,
          music_signals: musicSignals,
          entertainment_signals: entertainmentSignals,
          spam_signals: spamSignals,
        },
        rejection_reason: rejectionReason,
        confidence_score: confidenceScore,
      });
    }
    
    const validCount = results.filter(r => r.is_valid).length;
    const invalidCount = results.filter(r => !r.is_valid).length;
    
    console.log(`Verification complete: ${validCount} valid, ${invalidCount} rejected`);
    
    return new Response(
      JSON.stringify({
        total: content.length,
        valid_count: validCount,
        invalid_count: invalidCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ error: 'An internal error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
