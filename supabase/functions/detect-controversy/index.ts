import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SocialPost {
  platform: 'x' | 'reddit' | 'youtube' | 'tiktok' | 'instagram';
  post_id?: string;
  post_url?: string;
  post_text: string;
  author?: string;
  posted_at?: string;
  engagement_count?: number;
}

interface BatchRequest {
  posts: SocialPost[];
  window_minutes?: number; // Detection window (default 3 min)
}

interface KeywordBucket {
  bucket_name: string;
  keywords: string[];
  league: string | null;
}

interface TeamMapping {
  league: string;
  team_name: string;
  aliases: string[];
}

interface DetectionResult {
  post: SocialPost;
  teams_detected: string[];
  leagues_detected: string[];
  officiating_keywords: string[];
  rule_keywords: string[];
  emotion_keywords: string[];
  bucket_count: number;
  should_flag: boolean;
}

// Normalize text for matching
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/['']/g, "'").replace(/[""]/g, '"');
}

// Check if keyword exists in text (word boundary aware)
function containsKeyword(text: string, keyword: string): boolean {
  const normalizedText = normalizeText(text);
  const normalizedKeyword = normalizeText(keyword);
  
  // Create word boundary pattern
  const escapedKeyword = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
  
  return pattern.test(normalizedText);
}

// Analyze a single post against keyword buckets and team mappings
function analyzePost(
  post: SocialPost,
  keywordBuckets: KeywordBucket[],
  teamMappings: TeamMapping[]
): DetectionResult {
  const text = post.post_text;
  const normalizedText = normalizeText(text);
  
  // Detect teams and their leagues
  const teamsDetected: Set<string> = new Set();
  const leaguesDetected: Set<string> = new Set();
  
  for (const team of teamMappings) {
    for (const alias of team.aliases) {
      if (containsKeyword(text, alias)) {
        teamsDetected.add(team.team_name);
        leaguesDetected.add(team.league);
        break;
      }
    }
    // Also check official name
    if (containsKeyword(text, team.team_name)) {
      teamsDetected.add(team.team_name);
      leaguesDetected.add(team.league);
    }
  }
  
  // Get relevant buckets based on detected leagues
  const relevantBuckets = keywordBuckets.filter(bucket => 
    bucket.league === null || leaguesDetected.has(bucket.league)
  );
  
  // Detect keywords by category
  const officiatingKeywords: Set<string> = new Set();
  const ruleKeywords: Set<string> = new Set();
  const emotionKeywords: Set<string> = new Set();
  
  for (const bucket of relevantBuckets) {
    for (const keyword of bucket.keywords) {
      if (containsKeyword(text, keyword)) {
        if (bucket.bucket_name === 'officiating') {
          officiatingKeywords.add(keyword);
        } else if (bucket.bucket_name.startsWith('rule_')) {
          ruleKeywords.add(keyword);
        } else if (bucket.bucket_name === 'emotion') {
          emotionKeywords.add(keyword);
        }
      }
    }
  }
  
  // Count how many buckets have matches
  let bucketCount = 0;
  if (officiatingKeywords.size > 0) bucketCount++;
  if (ruleKeywords.size > 0) bucketCount++;
  if (emotionKeywords.size > 0) bucketCount++;
  
  // Determine if this should be flagged
  // Flag when: multiple buckets + team mention
  const shouldFlag = bucketCount >= 2 && teamsDetected.size > 0;
  
  return {
    post,
    teams_detected: Array.from(teamsDetected),
    leagues_detected: Array.from(leaguesDetected),
    officiating_keywords: Array.from(officiatingKeywords),
    rule_keywords: Array.from(ruleKeywords),
    emotion_keywords: Array.from(emotionKeywords),
    bucket_count: bucketCount,
    should_flag: shouldFlag,
  };
}

// Calculate engagement velocity score
function calculateVelocityScore(
  flaggedPosts: DetectionResult[],
  windowMinutes: number
): number {
  // Simple scoring: posts per minute * average bucket count
  const postsPerMinute = flaggedPosts.length / windowMinutes;
  const avgBucketCount = flaggedPosts.reduce((sum, p) => sum + p.bucket_count, 0) / flaggedPosts.length;
  
  // Normalize to 0-100 scale
  // Assuming 10+ posts/minute with 3 bucket average = 100
  const rawScore = (postsPerMinute / 10) * (avgBucketCount / 3) * 100;
  return Math.min(100, Math.round(rawScore * 10) / 10);
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request
    const { posts, window_minutes = 3 }: BatchRequest = await req.json();
    
    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No posts provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing ${posts.length} posts in ${window_minutes} minute window`);
    
    // Fetch keyword buckets
    const { data: buckets, error: bucketsError } = await supabase
      .from('keyword_buckets')
      .select('bucket_name, keywords, league')
      .eq('is_active', true);
    
    if (bucketsError) {
      console.error('Error fetching buckets:', bucketsError);
      throw new Error('Failed to fetch keyword configuration');
    }
    
    // Fetch team mappings
    const { data: teams, error: teamsError } = await supabase
      .from('team_mappings')
      .select('league, team_name, aliases')
      .eq('is_active', true);
    
    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      throw new Error('Failed to fetch team mappings');
    }
    
    console.log(`Loaded ${buckets?.length || 0} keyword buckets and ${teams?.length || 0} team mappings`);
    
    // Analyze each post
    const results: DetectionResult[] = posts.map(post => 
      analyzePost(post, buckets || [], teams || [])
    );
    
    // Filter to flagged posts only
    const flaggedResults = results.filter(r => r.should_flag);
    
    console.log(`${flaggedResults.length} of ${posts.length} posts flagged for review`);
    
    if (flaggedResults.length === 0) {
      return new Response(
        JSON.stringify({ 
          flagged: false,
          analyzed_count: posts.length,
          flagged_count: 0,
          message: 'No controversy signals detected'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Group flagged posts by team combination
    const teamGroups: Map<string, DetectionResult[]> = new Map();
    
    for (const result of flaggedResults) {
      const teamKey = result.teams_detected.sort().join('|') || 'unknown';
      if (!teamGroups.has(teamKey)) {
        teamGroups.set(teamKey, []);
      }
      teamGroups.get(teamKey)!.push(result);
    }
    
    // Create flagged moments for each team group
    const createdMoments: string[] = [];
    
    for (const [teamKey, groupedResults] of teamGroups) {
      const teams = teamKey.split('|').filter(t => t !== 'unknown');
      const leagues = [...new Set(groupedResults.flatMap(r => r.leagues_detected))];
      
      // Aggregate keywords across all posts in this group
      const allOfficiating = [...new Set(groupedResults.flatMap(r => r.officiating_keywords))];
      const allRule = [...new Set(groupedResults.flatMap(r => r.rule_keywords))];
      const allEmotion = [...new Set(groupedResults.flatMap(r => r.emotion_keywords))];
      
      // Calculate velocity score
      const velocityScore = calculateVelocityScore(groupedResults, window_minutes);
      
      // Use the first post's text as source_text
      const representativePost = groupedResults[0].post;
      
      // Create the flagged moment
      const { data: moment, error: momentError } = await supabase
        .from('flagged_moments')
        .insert({
          teams: teams,
          league: leagues[0] || null,
          officiating_keywords: allOfficiating,
          rule_keywords: allRule,
          emotion_keywords: allEmotion,
          bucket_count: Math.max(...groupedResults.map(r => r.bucket_count)),
          platform: representativePost.platform,
          source_url: representativePost.post_url,
          source_text: representativePost.post_text,
          engagement_velocity_score: velocityScore,
          post_volume: groupedResults.length,
          status: 'flagged',
        })
        .select('id')
        .single();
      
      if (momentError) {
        console.error('Error creating flagged moment:', momentError);
        continue;
      }
      
      createdMoments.push(moment.id);
      
      // Store all social posts linked to this moment
      const socialPostInserts = groupedResults.map(result => ({
        flagged_moment_id: moment.id,
        platform: result.post.platform,
        post_id: result.post.post_id,
        post_url: result.post.post_url,
        post_text: result.post.post_text,
        author: result.post.author,
        posted_at: result.post.posted_at,
        engagement_count: result.post.engagement_count,
        detected_keywords: [
          ...result.officiating_keywords,
          ...result.rule_keywords,
          ...result.emotion_keywords,
        ],
      }));
      
      const { error: postsError } = await supabase
        .from('social_posts')
        .insert(socialPostInserts);
      
      if (postsError) {
        console.error('Error storing social posts:', postsError);
      }
    }
    
    return new Response(
      JSON.stringify({
        flagged: true,
        analyzed_count: posts.length,
        flagged_count: flaggedResults.length,
        moments_created: createdMoments.length,
        moment_ids: createdMoments,
        summary: {
          teams: [...new Set(flaggedResults.flatMap(r => r.teams_detected))],
          leagues: [...new Set(flaggedResults.flatMap(r => r.leagues_detected))],
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Detection error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Detection failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});