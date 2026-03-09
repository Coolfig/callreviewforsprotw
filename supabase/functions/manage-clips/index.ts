import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate JWT and check admin role
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = claimsData.claims.sub;

  // Check admin role
  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: roleCheck } = await serviceClient.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });

  if (!roleCheck) {
    return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { action, ...data } = await req.json();

    switch (action) {
      case "upsert_video": {
        const { youtube_url, youtube_id, title } = data;
        const { data: existing } = await serviceClient
          .from("videos")
          .select("*")
          .eq("youtube_id", youtube_id)
          .maybeSingle();

        if (existing) {
          return new Response(JSON.stringify(existing), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const { data: video, error } = await serviceClient
          .from("videos")
          .insert({ youtube_url, youtube_id, title: title || null })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify(video), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "save_clip": {
        const { video_id, clip_title, start_seconds, end_seconds, notes, tags } = data;
        const { data: clip, error } = await serviceClient
          .from("clips")
          .insert({ video_id, clip_title, start_seconds, end_seconds, notes: notes || null, tags: tags || [] })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify(clip), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case "update_clip": {
        const { id, clip_title, start_seconds, end_seconds, notes, tags } = data;
        const { data: clip, error } = await serviceClient
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
        const { error } = await serviceClient.from("clips").delete().eq("id", id);
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
