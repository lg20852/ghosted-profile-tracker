
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import Stripe from "https://esm.sh/stripe@13.11.0";

const handler = async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not set in environment variables");
      throw new Error("Payment service is not properly configured. Please contact support.");
    }

    console.log("Initializing Stripe with secret key");
    let stripe;
    
    try {
      stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
      });
    } catch (stripeInitError) {
      console.error("Failed to initialize Stripe:", stripeInitError);
      throw new Error("Payment service initialization failed. Please contact support.");
    }

    // Parse request body
    const { amount, ghostName, companyName, spookCount } = await req.json();
    
    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    const displayName = companyName || ghostName;
    
    console.log(`Creating payment intent for ${displayName} with amount ${amount}`);
    
    // Create Payment Intent
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert dollar amount to cents
        currency: "usd",
        metadata: {
          ghostName,
          companyName,
          spookCount: String(spookCount),
        },
        automatic_payment_methods: {
          enabled: true,
        },
        description: `Settlement payment for ${spookCount} ghosting incident${spookCount !== 1 ? 's' : ''} - ${displayName}`
      });
    } catch (paymentIntentError) {
      console.error("Failed to create payment intent:", paymentIntentError);
      // Return a more specific error based on the Stripe error
      if (paymentIntentError.type === "StripeAuthenticationError") {
        throw new Error("Payment service authentication failed. Please contact support.");
      } else {
        throw new Error(`Payment initialization failed: ${paymentIntentError.message}`);
      }
    }

    console.log("Payment intent created successfully");
    
    return new Response(JSON.stringify({ 
      clientSecret: paymentIntent.client_secret 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create payment intent",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
