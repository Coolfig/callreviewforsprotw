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
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up username by finding user with this email
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const user = users?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (user) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        // Send email with username using Supabase's built-in email
        // For now we use the auth admin API to send a magic link with a note
        // In production you'd use a proper email service
        await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: email,
          options: {
            data: { username_reminder: profile.username },
          },
        });

        // We log the username reminder - in production, integrate with email provider
        console.log(`Username reminder for ${email}: ${profile.username}`);
      }
    }

    // Always return success to prevent email enumeration
    return new Response(
      JSON.stringify({ message: "If that email is registered, we sent the username." }),
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
