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
    const { orderId, userEmail } = await req.json();

    if (!orderId || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: orderId, userEmail" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get PayPal credentials
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalSecret = Deno.env.get("PAYPAL_SECRET");
    const paypalMode = Deno.env.get("PAYPAL_MODE") || "sandbox";

    if (!paypalClientId || !paypalSecret) {
      return new Response(
        JSON.stringify({ error: "PayPal credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get PayPal access token
    const authBase64 = btoa(`${paypalClientId}:${paypalSecret}`);
    const paypalUrl =
      paypalMode === "live"
        ? "https://api.paypal.com"
        : "https://api.sandbox.paypal.com";

    const tokenResponse = await fetch(`${paypalUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authBase64}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("PayPal token error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get PayPal access token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { access_token } = await tokenResponse.json();

    // Capture PayPal order
    const captureResponse = await fetch(`${paypalUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!captureResponse.ok) {
      const error = await captureResponse.text();
      console.error("PayPal capture error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to capture PayPal order" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const capturedOrder = await captureResponse.json();

    // Update database with payment status
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const transactionId =
      capturedOrder.purchase_units[0]?.payments?.captures[0]?.id || orderId;

    const { error: updateError } = await supabaseClient
      .from("payments")
      .update({
        status: "COMPLETED",
        transaction_id: transactionId,
        paypal_order: capturedOrder,
        completed_at: new Date().toISOString(),
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

    // Also create a subscription or grant access to user
    const { error: accessError } = await supabaseClient.from("user_subscriptions").insert([
      {
        user_email: userEmail,
        subscription_status: "active",
        payment_id: transactionId,
        amount: capturedOrder.purchase_units[0].amount.value,
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      },
    ]);

    if (accessError) {
      console.error("Subscription creation error:", accessError);
      // Don't fail - payment succeeded, subscription creation is secondary
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: orderId,
        transactionId: transactionId,
        status: capturedOrder.status,
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
