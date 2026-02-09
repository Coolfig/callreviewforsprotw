import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { action, ...data } = await req.json();

    switch (action) {
      case "upsert_video": {
        const { youtube_url, youtube_id, title } = data;
        // Try to find existing
        const { data: existing } = await supabase
          .from("videos")
          .select("*")
          .eq("youtube_id", youtube_id)
          .maybeSingle();

        if (existing) {
          return new Response(JSON.stringify(existing), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const { data: video, error } = await supabase
          .from("videos")
          .insert({ youtube_url, youtube_id, title: title || null })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify(video), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "save_clip": {
        const { video_id, clip_title, start_seconds, end_seconds, notes, tags } = data;
        const { data: clip, error } = await supabase
          .from("clips")
          .insert({ video_id, clip_title, start_seconds, end_seconds, notes: notes || null, tags: tags || [] })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify(clip), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "update_clip": {
        const { id, clip_title, start_seconds, end_seconds, notes, tags } = data;
        const { data: clip, error } = await supabase
          .from("clips")
          .update({ clip_title, start_seconds, end_seconds, notes: notes || null, tags: tags || [] })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify(clip), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "delete_clip": {
        const { id } = data;
        const { error } = await supabase.from("clips").delete().eq("id", id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
