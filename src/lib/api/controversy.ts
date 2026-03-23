import { supabase } from "@/integrations/supabase/client";

export type Platform = 'x' | 'reddit' | 'youtube' | 'tiktok' | 'instagram';
export type DetectionStatus = 'flagged' | 'reviewing' | 'confirmed' | 'dismissed';

export interface SocialPost {
  platform: Platform;
  post_id?: string;
  post_url?: string;
  post_text: string;
  author?: string;
  posted_at?: string;
  engagement_count?: number;
}

export interface ContentToVerify {
  url: string;
  title?: string;
  description?: string;
  caption?: string;
  platform: Platform;
}

export interface VerificationResult {
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

export interface VerificationResponse {
  total: number;
  valid_count: number;
  invalid_count: number;
  results: VerificationResult[];
}

export interface FlaggedMoment {
  id: string;
  detected_at: string;
  game_timestamp: string | null;
  teams: string[];
  players: string[] | null;
  officiating_keywords: string[];
  rule_keywords: string[];
  emotion_keywords: string[];
  bucket_count: number;
  platform: Platform;
  source_url: string | null;
  source_text: string | null;
  engagement_velocity_score: number;
  post_volume: number;
  status: DetectionStatus;
  league: string | null;
  created_at: string;
  content_verified?: boolean;
  verification_reason?: string | null;
}

export interface DetectionResponse {
  flagged: boolean;
  analyzed_count: number;
  flagged_count: number;
  moments_created?: number;
  moment_ids?: string[];
  message?: string;
  summary?: {
    teams: string[];
    leagues: string[];
  };
}

// Verify content before allowing into controversy pipeline
export async function verifyContent(
  content: ContentToVerify[]
): Promise<VerificationResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Authentication required for content verification');
  }

  const { data, error } = await supabase.functions.invoke('verify-content', {
    body: { content },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    console.error('Verification error:', error);
    throw new Error(error.message || 'Failed to verify content');
  }

  return data;
}

// Submit posts for controversy detection (only verified content should reach here)
export async function detectControversy(
  posts: SocialPost[],
  windowMinutes: number = 3
): Promise<DetectionResponse> {
  // Get current session for auth header
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Authentication required to run controversy detection');
  }

  const { data, error } = await supabase.functions.invoke('detect-controversy', {
    body: { posts, window_minutes: windowMinutes },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    console.error('Detection error:', error);
    throw new Error(error.message || 'Failed to detect controversy');
  }

  return data;
}

// Full pipeline: verify then detect
export async function verifyAndDetect(
  posts: Array<SocialPost & { title?: string; description?: string; caption?: string }>
): Promise<{
  verification: VerificationResponse;
  detection: DetectionResponse | null;
  rejected_posts: SocialPost[];
}> {
  // First, verify all content
  const contentToVerify: ContentToVerify[] = posts.map(post => ({
    url: post.post_url || '',
    title: post.title,
    description: post.description,
    caption: post.caption,
    platform: post.platform,
  }));

  const verification = await verifyContent(contentToVerify);

  // Filter to only valid posts
  const validUrls = new Set(
    verification.results.filter(r => r.is_valid).map(r => r.url)
  );

  const validPosts = posts.filter(p => validUrls.has(p.post_url || ''));
  const rejectedPosts = posts.filter(p => !validUrls.has(p.post_url || ''));

  // If no valid posts, skip detection
  if (validPosts.length === 0) {
    return {
      verification,
      detection: null,
      rejected_posts: rejectedPosts,
    };
  }

  // Run controversy detection on valid posts only
  const detection = await detectControversy(validPosts);

  return {
    verification,
    detection,
    rejected_posts: rejectedPosts,
  };
}

// Fetch flagged moments for review queue
export async function getFlaggedMoments(
  status?: DetectionStatus,
  limit: number = 50
): Promise<FlaggedMoment[]> {
  let query = supabase
    .from('flagged_moments')
    .select('*')
    .order('detected_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching flagged moments:', error);
    throw new Error(error.message || 'Failed to fetch flagged moments');
  }

  return (data || []) as FlaggedMoment[];
}

// Update moment status
export async function updateMomentStatus(
  momentId: string,
  status: DetectionStatus
): Promise<void> {
  const { error } = await supabase
    .from('flagged_moments')
    .update({ status })
    .eq('id', momentId);

  if (error) {
    console.error('Error updating moment status:', error);
    throw new Error(error.message || 'Failed to update status');
  }
}

// Get social posts for a flagged moment
export async function getSocialPostsForMoment(momentId: string) {
  const { data, error } = await supabase
    .from('social_posts')
    .select('*')
    .eq('flagged_moment_id', momentId)
    .order('posted_at', { ascending: false });

  if (error) {
    console.error('Error fetching social posts:', error);
    throw new Error(error.message || 'Failed to fetch social posts');
  }

  return data || [];
}

// Subscribe to new flagged moments in real-time
export function subscribeToFlaggedMoments(
  callback: (moment: FlaggedMoment) => void
) {
  const channel = supabase
    .channel('flagged_moments_realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'flagged_moments',
      },
      (payload) => {
        callback(payload.new as FlaggedMoment);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}