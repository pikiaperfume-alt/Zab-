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
    const { amount, description, userEmail, currency } = await req.json();

    if (!amount || !description || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: amount, description, userEmail" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const consumerKey =
      Deno.env.get("PESAPAL_CONSUMER_KEY") || Deno.env.get("PESAPAL_KEY");
    const consumerSecret =
      Deno.env.get("PESAPAL_CONSUMER_SECRET") || Deno.env.get("PESAPAL_SECRET");
    const pesapalMode = Deno.env.get("PESAPAL_MODE") || "sandbox";
    const callbackUrl = Deno.env.get("PESAPAL_CALLBACK_URL");
    const cancellationUrl = Deno.env.get("PESAPAL_CANCEL_URL");
    const notificationId = Deno.env.get("PESAPAL_NOTIFICATION_ID");

    if (!consumerKey || !consumerSecret || !callbackUrl || !notificationId) {
      return new Response(
        JSON.stringify({ error: "PesaPal configuration is incomplete" }),
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
        JSON.stringify({ error: "PesaPal token response was invalid" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const merchantReference = `zab-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const amountNumber = Number(amount);

    if (!Number.isFinite(amountNumber)) {
      return new Response(
        JSON.stringify({ error: "Invalid amount provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedAmount = amountNumber.toFixed(2);
    const requestCurrency = String(currency || "UGX").toUpperCase();

    const orderResponse = await fetch(`${baseUrl}/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        id: merchantReference,
        currency: requestCurrency,
        amount: formattedAmount,
        description,
        callback_url: callbackUrl,
        cancellation_url: cancellationUrl || callbackUrl,
        notification_id: notificationId,
        redirect_mode: "TOP_WINDOW",
        billing_address: {
          email_address: userEmail,
          phone_number: "",
          country: "",
          first_name: "",
          last_name: "",
          line_1: "",
          line_2: "",
          city: "",
          state: "",
          postal_code: "",
          zip_code: "",
        },
      }),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.text();
      console.error("PesaPal order creation error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create PesaPal order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const order = await orderResponse.json();
    const redirectUrl = order?.redirect_url || order?.redirectUrl;
    const responseStatus = order?.status ?? order?.Status;

    if ((!responseStatus || responseStatus === "200" || responseStatus === 200) && redirectUrl) {
      // valid response shape
    } else if (!redirectUrl) {
      return new Response(
        JSON.stringify({ error: order?.message || "Invalid PesaPal order response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const { error: dbError } = await supabaseClient
      .from("payments")
      .insert([
        {
          user_email: userEmail,
          order_id: order.order_tracking_id || order.orderTrackingId || merchantReference,
          amount: amountNumber,
          description,
          status: "CREATED",
          pesapal_order: order,
        },
      ]);

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to store order in database" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        orderId: order.order_tracking_id || order.orderTrackingId || merchantReference,
        redirectUrl,
        links: [{ rel: "approve", href: redirectUrl }],
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
