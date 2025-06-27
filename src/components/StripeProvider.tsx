import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { Loader, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ErrorBoundary from "./ErrorBoundary";

// Updated to use TEST publishable key instead of live
const STRIPE_PUBLISHABLE_KEY = "pk_test_51RN3k4Al4XSYcvLdUdnBKJg8fN1YSgKcfP2vFzX3LgJ8iYSg9B2ITGhGu4XcFEiDSoPJS8q72N82Sh1c5wJknXxtiRE00YfUlkcnI";

// Enhanced configuration for better reliability
const MAX_INITIALIZATION_ATTEMPTS = 3;
const INITIALIZATION_TIMEOUT = 30000; // 30 seconds
const RETRY_DELAY = 3000; // 3 seconds between retries

interface StripeProviderProps {
  clientSecret: string | null;
  children: React.ReactNode;
}

const StripeFallback = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex justify-center items-center p-8 flex-col space-y-4">
    <AlertCircle className="h-8 w-8 text-amber-500" />
    <p className="text-amber-500 font-medium">
      Payment system failed to initialize
    </p>
    <Button 
      onClick={onRetry}
      className="px-4 py-2 flex items-center gap-2"
    >
      <RefreshCw className="h-4 w-4" />
      Retry Connection
    </Button>
  </div>
);

const StripeProvider: React.FC<StripeProviderProps> = ({ clientSecret, children }) => {
  const [loading, setLoading] = useState(true);
  const [stripeInitialized, setStripeInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripeInstance, setStripeInstance] = useState<Promise<Stripe | null> | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const { toast } = useToast();
  
  const initializeStripe = async (forceRefresh = false) => {
    console.log(`[StripeProvider] Starting initialization attempt ${attemptCount + 1}/${MAX_INITIALIZATION_ATTEMPTS}`);
    setLoading(true);
    setError(null);
    
    try {
      // Validate publishable key format - now checking for test key
      if (!STRIPE_PUBLISHABLE_KEY.startsWith("pk_test_") && !STRIPE_PUBLISHABLE_KEY.startsWith("pk_live_")) {
        throw new Error("Invalid Stripe publishable key format");
      }
      
      // Log which mode we're using
      const mode = STRIPE_PUBLISHABLE_KEY.startsWith("pk_test_") ? "TEST" : "LIVE";
      console.log(`[StripeProvider] Using Stripe in ${mode} mode`);
      
      console.log("[StripeProvider] Creating Stripe instance...");
      const newStripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
      setStripeInstance(newStripePromise);
      
      // Race between Stripe loading and timeout
      const stripe = await Promise.race([
        newStripePromise,
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error("Stripe initialization timeout")), INITIALIZATION_TIMEOUT)
        )
      ]);
      
      if (!stripe) {
        throw new Error("Failed to initialize Stripe - service unavailable");
      }
      
      console.log("[StripeProvider] Stripe initialized successfully");
      setStripeInitialized(true);
      setError(null);
      setAttemptCount(0);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[StripeProvider] Initialization failed (attempt ${attemptCount + 1}):`, errorMessage);
      
      setAttemptCount(prev => prev + 1);
      
      // Retry logic with exponential backoff
      if (attemptCount < MAX_INITIALIZATION_ATTEMPTS - 1) {
        const delay = RETRY_DELAY * Math.pow(2, attemptCount); // Exponential backoff
        console.log(`[StripeProvider] Retrying in ${delay}ms...`);
        
        setTimeout(() => {
          initializeStripe(true);
        }, delay);
        return;
      }
      
      // All attempts failed
      let userFriendlyError = "Failed to connect to payment system.";
      
      if (errorMessage.includes("timeout")) {
        userFriendlyError = "Payment system is taking too long to respond. Please check your internet connection.";
      } else if (errorMessage.includes("API key") || errorMessage.includes("Invalid")) {
        userFriendlyError = "Payment system configuration error. Make sure you're using matching test keys in both frontend and backend.";
      } else if (errorMessage.includes("network") || errorMessage.includes("connection")) {
        userFriendlyError = "Network connection issue. Please check your internet and try again.";
      }
      
      setError(userFriendlyError);
      
      toast({
        title: "Payment System Error",
        description: userFriendlyError,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Initialize on component mount
  useEffect(() => {
    console.log("[StripeProvider] Component mounted, initializing...");
    initializeStripe();
    
    return () => {
      console.log("[StripeProvider] Component unmounting");
    };
  }, []);

  // Handle client secret changes
  useEffect(() => {
    if (clientSecret) {
      console.log("[StripeProvider] Client secret received, Elements will be ready");
    }
  }, [clientSecret]);
  
  const handleRetry = () => {
    console.log("[StripeProvider] Manual retry requested");
    setAttemptCount(0);
    toast({
      title: "Retrying connection",
      description: "Attempting to reconnect to the payment system...",
    });
    initializeStripe(true);
  };
  
  // Show error state with retry option
  if (error) {
    return (
      <ErrorBoundary>
        <div className="flex justify-center items-center p-8 flex-col space-y-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-red-600 font-medium text-center">{error}</p>
          <p className="text-sm text-muted-foreground text-center">
            Make sure you're using matching Stripe test keys in both your frontend and Supabase edge function.
          </p>
          <Button 
            onClick={handleRetry}
            className="px-4 py-2 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </ErrorBoundary>
    );
  }

  // Show loading state
  if (loading || !stripeInitialized) {
    return (
      <ErrorBoundary>
        <div className="flex justify-center items-center p-8 flex-col space-y-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">
            Connecting to payment system...
          </p>
          <p className="text-xs text-muted-foreground">
            Attempt {attemptCount + 1} of {MAX_INITIALIZATION_ATTEMPTS}
          </p>
        </div>
      </ErrorBoundary>
    );
  }

  // Show waiting for client secret
  if (!clientSecret) {
    console.log("[StripeProvider] Waiting for client secret...");
    return (
      <ErrorBoundary>
        <div className="flex justify-center items-center p-8 flex-col space-y-4">
          <Loader className="h-6 w-6 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">
            Preparing payment information...
          </p>
        </div>
      </ErrorBoundary>
    );
  }

  console.log("[StripeProvider] Rendering Stripe Elements");

  return (
    <ErrorBoundary fallback={<StripeFallback onRetry={handleRetry} />}>
      <Elements
        stripe={stripeInstance}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#000000',
              colorBackground: '#ffffff',
              colorText: '#30313d',
              fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              borderRadius: '8px',
              fontSizeBase: '16px',
            },
            rules: {
              '.Input': {
                boxShadow: 'none',
                padding: '12px',
              },
              '.Tab': {
                padding: '10px 16px',
              },
            },
          },
        }}
      >
        {children}
      </Elements>
    </ErrorBoundary>
  );
};

export default StripeProvider;
