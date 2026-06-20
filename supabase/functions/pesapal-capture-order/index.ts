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
    const { orderId, userEmail } = await req.json();

    if (!orderId || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: orderId, userEmail" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const consumerKey = Deno.env.get("PESAPAL_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("PESAPAL_CONSUMER_SECRET");
    const pesapalMode = Deno.env.get("PESAPAL_MODE") || "sandbox";

    if (!consumerKey || !consumerSecret) {
      return new Response(
        JSON.stringify({ error: "PesaPal credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const baseUrl =
      pesapalMode === "live"
        ? "https://pay.pesapal.com/v3/api"
        : "https://cybqa.pesapal.com/pesapalv3/api";

    const tokenResponse = await fetch(`${baseUrl}/Auth/RequestToken`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("PesaPal token error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get PesaPal access token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.token || tokenData.access_token || tokenData.accessToken;

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Invalid PesaPal token response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const statusResponse = await fetch(
      `${baseUrl}/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!statusResponse.ok) {
      const error = await statusResponse.text();
      console.error("PesaPal status check error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to check PesaPal transaction status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const transaction = await statusResponse.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const paymentStatus =
      transaction?.status === "200" || transaction?.status === 0
        ? "COMPLETED"
        : "CREATED";

    const { error: updateError } = await supabaseClient
      .from("payments")
      .update({
        status: paymentStatus,
        transaction_id: orderId,
        pesapal_order: transaction,
        completed_at: paymentStatus === "COMPLETED" ? new Date().toISOString() : null,
      })
      .eq("order_id", orderId)
      .eq("user_email", userEmail);

    if (updateError) {
      console.error("Database update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update payment status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        transactionId: orderId,
        status: paymentStatus,
        transaction,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
