
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import Stripe from "https://esm.sh/stripe@13.11.0";

const handler = async (req: Request) => {
  // Helper function for consistent logging
  const logStep = (step: string, details?: any) => {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
    console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
  };

  logStep("Function started");

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // IMPORTANT: This should be the secret key, not the publishable key
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (!STRIPE_SECRET_KEY) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      throw new Error("Payment service is not properly configured. Please contact support.");
    }

    // Check if the key provided matches the pattern of a secret key (starts with sk_)
    if (!STRIPE_SECRET_KEY.startsWith("sk_")) {
      logStep("ERROR: Invalid STRIPE_SECRET_KEY format - expecting secret key (sk_)");
      throw new Error("The Stripe key appears to be invalid. Secret keys should start with 'sk_'. Please check your configuration.");
    }

    logStep("Initializing Stripe with secret key");
    let stripe;
    
    try {
      stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
      });
    } catch (stripeInitError) {
      logStep("Failed to initialize Stripe", stripeInitError);
      throw new Error(`Payment service initialization failed: ${stripeInitError.message}`);
    }

    // Parse request body
    const requestData = await req.json();
    logStep("Request data received", { 
      amount: requestData.amount,
      ghostName: requestData.ghostName,
      companyName: requestData.companyName,
      spookCount: requestData.spookCount
    });
    
    const { amount, ghostName, companyName, spookCount } = requestData;
    
    if (!amount || amount <= 0) {
      logStep("Invalid amount provided", { amount });
      throw new Error("Invalid amount");
    }

    const displayName = companyName || ghostName;
    
    logStep(`Creating payment intent for ${displayName} with amount ${amount}`);
    
    // Create Payment Intent with proper error handling
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
      
      logStep("Payment intent created successfully", { 
        id: paymentIntent.id, 
        clientSecret: paymentIntent.client_secret?.slice(0, 10) + '...' 
      });
    } catch (paymentIntentError) {
      logStep("Failed to create payment intent", paymentIntentError);
      
      // Return specific errors based on Stripe error types
      if (paymentIntentError.type === "StripeAuthenticationError" || 
          paymentIntentError.message?.includes("Invalid API Key")) {
        throw new Error("Payment service authentication failed. Please contact support.");
      } else if (paymentIntentError.type === "StripeConnectionError") {
        throw new Error("Could not connect to payment service. Please try again later.");
      } else {
        throw new Error(`Payment initialization failed: ${paymentIntentError.message}`);
      }
    }
    
    return new Response(JSON.stringify({ 
      clientSecret: paymentIntent.client_secret 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("Error creating payment intent", { message: error.message, stack: error.stack });
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
