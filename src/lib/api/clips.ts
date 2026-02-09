import { supabase } from "@/integrations/supabase/client";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-clips`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function callFunction(body: Record<string, unknown>) {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function upsertVideo(youtube_url: string, youtube_id: string, title?: string) {
  return callFunction({ action: "upsert_video", youtube_url, youtube_id, title });
}

export async function saveClip(data: {
  video_id: string;
  clip_title: string;
  start_seconds: number;
  end_seconds: number;
  notes?: string;
  tags?: string[];
}) {
  return callFunction({ action: "save_clip", ...data });
}

export async function updateClip(data: {
  id: string;
  clip_title: string;
  start_seconds: number;
  end_seconds: number;
  notes?: string;
  tags?: string[];
}) {
  return callFunction({ action: "update_clip", ...data });
}

export async function deleteClip(id: string) {
  return callFunction({ action: "delete_clip", id });
}

export async function fetchClipsForVideo(videoId: string) {
  const { data, error } = await supabase
    .from("clips")
    .select("*")
    .eq("video_id", videoId)
    .order("start_seconds", { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchAllClips() {
  const { data, error } = await supabase
    .from("clips")
    .select("*, videos(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
