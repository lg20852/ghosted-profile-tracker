
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import Stripe from "https://esm.sh/stripe@13.11.0";

const handler = async (req: Request) => {
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

  if (req.method !== "POST") {
    logStep("ERROR: Invalid method", { method: req.method });
    return new Response(
      JSON.stringify({
        error: "Method not allowed. Please use POST.",
      }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (!STRIPE_SECRET_KEY) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      throw new Error("Payment service is not properly configured. Please contact support.");
    }

    // Check if we're using test or live mode
    const isTestMode = STRIPE_SECRET_KEY.startsWith("sk_test_");
    const isLiveMode = STRIPE_SECRET_KEY.startsWith("sk_live_");
    
    if (!isTestMode && !isLiveMode) {
      logStep("ERROR: Invalid STRIPE_SECRET_KEY format - expecting secret key (sk_test_ or sk_live_)");
      throw new Error("The Stripe key appears to be invalid. Secret keys should start with 'sk_test_' or 'sk_live_'. Please check your configuration.");
    }

    const mode = isTestMode ? "TEST" : "LIVE";
    logStep(`Using Stripe in ${mode} mode`);

    logStep("Initializing Stripe with secret key");
    let stripe;
    
    try {
      stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
        timeout: 30000, // 30 second timeout
        maxNetworkRetries: 3, // Enable automatic retries
      });
      
      // Test the connection by making a simple API call
      logStep("Testing Stripe connection...");
      await stripe.balance.retrieve();
      logStep("Stripe connection test successful");
      
    } catch (stripeInitError) {
      logStep("Failed to initialize or test Stripe connection", stripeInitError);
      
      if (stripeInitError.type === "StripeAuthenticationError") {
        throw new Error(`Invalid Stripe secret key. Please verify your Stripe ${mode} configuration.`);
      } else if (stripeInitError.type === "StripeConnectionError") {
        throw new Error("Could not connect to Stripe servers. Please try again later.");
      } else {
        throw new Error(`Payment service initialization failed: ${stripeInitError.message}`);
      }
    }

    // Parse request body with timeout
    const requestPromise = req.json();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 10000);
    });
    
    const requestData = await Promise.race([requestPromise, timeoutPromise]);
    
    logStep("Request data received", { 
      amount: requestData.amount,
      ghostName: requestData.ghostName,
      companyName: requestData.companyName,
      spookCount: requestData.spookCount
    });
    
    const { amount, ghostName, companyName, spookCount } = requestData;
    
    if (!amount || amount <= 0) {
      logStep("Invalid amount provided", { amount });
      throw new Error("Invalid amount provided");
    }

    if (!ghostName && !companyName) {
      logStep("Missing ghost/company name");
      throw new Error("Missing required company or ghost name");
    }

    const displayName = companyName || ghostName;
    
    logStep(`Creating payment intent for ${displayName} with amount ${amount} in ${mode} mode`);
    
    // Generate idempotency key for duplicate prevention
    const idempotencyKey = `payment_${displayName}_${amount}_${spookCount}_${Date.now()}`.replace(/[^a-zA-Z0-9_]/g, '_');
    
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert dollar amount to cents
        currency: "usd",
        metadata: {
          ghostName: ghostName || "",
          companyName: companyName || "",
          spookCount: String(spookCount || 1),
          created_at: new Date().toISOString(),
          test_mode: isTestMode ? "true" : "false",
        },
        automatic_payment_methods: {
          enabled: true,
        },
        description: `Settlement payment for ${spookCount || 1} ghosting incident${(spookCount || 1) !== 1 ? 's' : ''} - ${displayName}`,
        statement_descriptor_suffix: "GHOSTED", // Fixed: Use statement_descriptor_suffix instead of statement_descriptor
      }, {
        idempotencyKey, // Prevent duplicate payments
      });
      
      logStep("Payment intent created successfully", { 
        id: paymentIntent.id, 
        clientSecret: paymentIntent.client_secret?.slice(0, 10) + '...', 
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        mode: mode
      });
      
    } catch (paymentIntentError) {
      logStep("Failed to create payment intent", paymentIntentError);
      
      if (paymentIntentError.type === "StripeAuthenticationError" || 
          paymentIntentError.message?.includes("Invalid API Key")) {
        throw new Error(`Payment service authentication failed. Please verify your Stripe ${mode} configuration.`);
      } else if (paymentIntentError.type === "StripeConnectionError") {
        throw new Error("Could not connect to payment service. Please check your internet connection and try again.");
      } else if (paymentIntentError.type === "StripeCardError") {
        throw new Error(`Card error: ${paymentIntentError.message}`);
      } else if (paymentIntentError.code === "amount_too_small") {
        throw new Error("Payment amount is too small. Minimum amount is $0.50 USD.");
      } else if (paymentIntentError.code === "amount_too_large") {
        throw new Error("Payment amount is too large. Please contact support for large payments.");
      } else {
        throw new Error(`Payment initialization failed: ${paymentIntentError.message || 'Unknown error'}`);
      }
    }
    
    // Validate the response before sending
    if (!paymentIntent.client_secret) {
      logStep("ERROR: No client secret in payment intent response");
      throw new Error("Payment service returned invalid response. Please try again.");
    }
    
    return new Response(JSON.stringify({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      testMode: isTestMode,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    logStep("Error creating payment intent", { 
      message: error.message, 
      type: error.type,
      code: error.code,
      stack: error.stack?.substring(0, 500) // Truncate stack trace
    });
    
    // Return user-friendly error messages
    let errorMessage = "Failed to create payment intent";
    let statusCode = 500;
    
    if (error.message.includes("timeout") || error.message.includes("Request timeout")) {
      errorMessage = "Request timed out. Please try again.";
      statusCode = 408;
    } else if (error.message.includes("network") || error.message.includes("connection")) {
      errorMessage = "Network error. Please check your connection and try again.";
      statusCode = 503;
    } else if (error.message.includes("authentication") || error.message.includes("Invalid API Key")) {
      errorMessage = "Payment service configuration error. Make sure you're using matching Stripe test keys.";
      statusCode = 500;
    } else if (error.message.includes("Invalid amount") || error.message.includes("Missing required")) {
      errorMessage = error.message;
      statusCode = 400;
    } else {
      errorMessage = error.message || "An unexpected error occurred";
    }
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: statusCode,
      }
    );
  }
};

serve(handler);
