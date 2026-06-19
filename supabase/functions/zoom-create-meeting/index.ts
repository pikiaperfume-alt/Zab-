import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { tutorId, tutorName, slot, isTutor } = await req.json();

    if (!tutorId || !tutorName || !slot) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: tutorId, tutorName, slot" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const zoomJwt = Deno.env.get("ZOOM_JWT");
    const zoomApiUrl = Deno.env.get("ZOOM_API_URL") || "https://api.zoom.us/v2";

    if (!zoomJwt) {
      return new Response(
        JSON.stringify({ error: "Zoom JWT not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const meetingResponse = await fetch(`${zoomApiUrl}/users/me/meetings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${zoomJwt}`,
      },
      body: JSON.stringify({
        topic: isTutor ? `ZAB instructor session · ${tutorName}` : `ZAB tutoring session · ${tutorName}`,
        type: 2,
        start_time: new Date().toISOString(),
        duration: 45,
        timezone: "UTC",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          approval_type: 2,
        },
      }),
    });

    if (!meetingResponse.ok) {
      const errorText = await meetingResponse.text();
      console.error("Zoom API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create Zoom meeting" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const meeting = await meetingResponse.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const { error: sessionError } = await supabaseClient.from("tutor_sessions").insert([
      {
        tutor_id: tutorId,
        title: isTutor ? `Instructor session · ${slot}` : `Tutoring call · ${slot}`,
        description: `${isTutor ? 'Instructor-led' : 'Student booking'} session with ${tutorName}`,
        duration: "45 min",
        session_type: isTutor ? "Instructor class" : "Tutoring session",
        scheduled_slot: slot,
        zoom_meeting_id: meeting.id,
        zoom_join_url: meeting.join_url,
        zoom_start_url: meeting.start_url,
      },
    ]);

    if (sessionError) {
      console.error("Database error:", sessionError);
    }

    return new Response(
      JSON.stringify({
        join_url: meeting.join_url,
        start_url: meeting.start_url,
        meeting_id: meeting.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
