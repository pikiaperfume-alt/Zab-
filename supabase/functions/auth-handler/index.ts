import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, action, role } = await req.json();

    if (!email || !password || !action) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: email, password, action (signup/login)",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    if (action === "signup") {
      const normalizedRole = role === 'tutor' ? 'tutor' : 'student';

      // Create new user
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: false,
      });

      if (authError) {
        console.error("Auth error:", authError);
        return new Response(
          JSON.stringify({
            error: authError.message || "Failed to create user",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create user profile
      const { error: profileError } = await supabaseClient.from("user_profiles").insert([
        {
          user_id: authData.user.id,
          email: email,
          role: normalizedRole,
          subscription_status: "free",
          created_at: new Date().toISOString(),
        },
      ]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Don't fail the signup if profile creation fails
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "User created successfully. Please check your email to confirm.",
          userId: authData.user.id,
          email: email,
          role: normalizedRole,
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (action === "login") {
      // Sign in existing user
      const { data: authData, error: authError } =
        await supabaseClient.auth.signInWithPassword({
          email: email,
          password: password,
        });

      if (authError) {
        console.error("Login error:", authError);
        return new Response(
          JSON.stringify({
            error: authError.message || "Failed to login",
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get user profile
      const { data: profile } = await supabaseClient
        .from("user_profiles")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          message: "Logged in successfully",
          session: authData.session,
          user: {
            id: authData.user.id,
            email: authData.user.email,
            role: profile?.role || "student",
            subscription_status: profile?.subscription_status || "free",
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: "Invalid action. Must be 'signup' or 'login'",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
