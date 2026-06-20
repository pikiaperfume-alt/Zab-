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
    const body = await req.text();
    const payload = body ? JSON.parse(body) : {};

    const orderTrackingId = payload.OrderTrackingId || payload.order_tracking_id;
    const notificationType = payload.OrderNotificationType || payload.order_notification_type;
    const merchantReference = payload.OrderMerchantReference || payload.merchant_reference;

    if (!orderTrackingId || !merchantReference) {
      return new Response(
        JSON.stringify({ error: "Missing PesaPal callback payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const paymentStatus =
      notificationType === "IPNCHANGE" || payload.status === "COMPLETED"
        ? "COMPLETED"
        : "CREATED";

    const { error: updateError } = await supabaseClient
      .from("payments")
      .update({
        status: paymentStatus,
        transaction_id: orderTrackingId,
        pesapal_webhook_event: payload,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderTrackingId)
      .or(`order_id.eq.${merchantReference}`);

    if (updateError) {
      console.error("Database update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update payment status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
