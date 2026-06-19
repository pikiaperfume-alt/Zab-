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
    const body = await req.text();

    // Verify webhook with PayPal
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalSecret = Deno.env.get("PAYPAL_SECRET");
    const paypalMode = Deno.env.get("PAYPAL_MODE") || "sandbox";

    if (!paypalClientId || !paypalSecret) {
      return new Response(
        JSON.stringify({ error: "PayPal credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const paypalUrl =
      paypalMode === "live"
        ? "https://api.paypal.com"
        : "https://api.sandbox.paypal.com";

    // Verify webhook signature
    const authBase64 = btoa(`${paypalClientId}:${paypalSecret}`);
    const tokenResponse = await fetch(`${paypalUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authBase64}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      console.error("Failed to get token for webhook verification");
      return new Response("Unauthorized", { status: 401 });
    }

    const { access_token } = await tokenResponse.json();

    // Parse webhook body
    const webhookData = new URLSearchParams(body);
    const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");

    if (!webhookId) {
      console.error("PAYPAL_WEBHOOK_ID not configured");
      return new Response("Webhook not configured", { status: 500 });
    }

    const verifyResponse = await fetch(
      `${paypalUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transmission_id: req.headers.get("paypal-transmission-id"),
          transmission_time: req.headers.get("paypal-transmission-time"),
          cert_url: req.headers.get("paypal-cert-url"),
          auth_algo: req.headers.get("paypal-auth-algo"),
          transmission_sig: req.headers.get("paypal-transmission-sig"),
          webhook_id: webhookId,
          webhook_event: JSON.parse(body),
        }),
      }
    );

    if (!verifyResponse.ok) {
      console.error("Webhook verification failed");
      return new Response("Verification failed", { status: 401 });
    }

    const verifyResult = await verifyResponse.json();
    if (verifyResult.verification_status !== "SUCCESS") {
      console.error("Webhook verification not successful");
      return new Response("Verification unsuccessful", { status: 401 });
    }

    // Process webhook event
    const webhookEvent = JSON.parse(body);
    const eventType = webhookEvent.event_type;
    const resource = webhookEvent.resource;

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Handle different event types
    if (eventType === "CHECKOUT.ORDER.COMPLETED") {
      // Order was completed
      const { error: updateError } = await supabaseClient
        .from("payments")
        .update({
          status: "COMPLETED",
          paypal_webhook_event: webhookEvent,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", resource.id);

      if (updateError) {
        console.error("Database update error:", updateError);
      }
    } else if (eventType === "CHECKOUT.ORDER.APPROVED") {
      // Order was approved (not yet captured)
      const { error: updateError } = await supabaseClient
        .from("payments")
        .update({
          status: "APPROVED",
          paypal_webhook_event: webhookEvent,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", resource.id);

      if (updateError) {
        console.error("Database update error:", updateError);
      }
    } else if (eventType === "CHECKOUT.ORDER.PROCESSED") {
      // Order was processed and captured
      const transactionId = resource.supplementary_data?.related_ids?.order_transaction_id;
      const { error: updateError } = await supabaseClient
        .from("payments")
        .update({
          status: "PROCESSED",
          transaction_id: transactionId || resource.id,
          paypal_webhook_event: webhookEvent,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", resource.id);

      if (updateError) {
        console.error("Database update error:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
