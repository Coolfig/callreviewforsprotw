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

// Submit posts for controversy detection
export async function detectControversy(
  posts: SocialPost[],
  windowMinutes: number = 3
): Promise<DetectionResponse> {
  const { data, error } = await supabase.functions.invoke('detect-controversy', {
    body: { posts, window_minutes: windowMinutes },
  });

  if (error) {
    console.error('Detection error:', error);
    throw new Error(error.message || 'Failed to detect controversy');
  }

  return data;
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