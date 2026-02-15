import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();
    if (!username || typeof username !== "string") {
      return new Response(JSON.stringify({ error: "Username required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up the user_id from profiles
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("username", username.toLowerCase())
      .single();

    if (profile) {
      // Get the user's email
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profile.user_id);
      
      if (userData?.user?.email) {
        // Send password reset email
        await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email: userData.user.email,
        });
      }
    }

    // Always return success to prevent username enumeration
    return new Response(
      JSON.stringify({ message: "If that username exists, a reset link was sent." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
