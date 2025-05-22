
import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { Loader, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ErrorBoundary from "./ErrorBoundary";

// Update the LIVE publishable key to match your Stripe account
// Make sure this key is from the same Stripe account as your secret key in Supabase secrets
const STRIPE_PUBLISHABLE_KEY = "pk_live_51RN3k4Al4XSYcvLdnHh8glThz1Dr2A25On1lFDlJ8iYSg9B2ITGhGu4XcFEiDSoPJS8q72N82Sh1c5wJknXxtiRE00YfUlkcnI";

// Initialize Stripe outside component to prevent multiple instances
let stripeInitializationAttempts = 0;
const MAX_INITIALIZATION_ATTEMPTS = 5; // Increased from 3 to 5

interface StripeProviderProps {
  clientSecret: string | null;
  children: React.ReactNode;
}

// Custom fallback component for Stripe-specific errors
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
  const [timeoutError, setTimeoutError] = useState(false);
  // Store the stripe promise instead of the resolved instance
  const [stripeInstance, setStripeInstance] = useState<Promise<Stripe | null> | null>(null);
  const { toast } = useToast();
  
  const initializeStripe = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setTimeoutError(false);
    
    try {
      console.log("Starting Stripe initialization" + (forceRefresh ? " (forced refresh)" : ""));
      
      // Create a new promise that will resolve to the Stripe instance
      let newStripePromise: Promise<Stripe | null>;
      
      try {
        newStripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
        setStripeInstance(newStripePromise);
        
        // Attempt to resolve the promise to check for errors
        // Increased timeout from 10s to 30s
        const stripe = await Promise.race([
          newStripePromise,
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error("Stripe initialization timeout")), 30000)
          )
        ]);
        
        if (!stripe) {
          throw new Error("Failed to initialize Stripe");
        }
        
        console.log("Stripe initialized successfully");
        setStripeInitialized(true);
        setTimeoutError(false);
        setError(null);
      } catch (innerError) {
        console.error("Error during Stripe initialization:", innerError);
        
        // If this is not the last attempt, retry
        if (stripeInitializationAttempts < MAX_INITIALIZATION_ATTEMPTS) {
          stripeInitializationAttempts++;
          console.log(`Retrying Stripe initialization (attempt ${stripeInitializationAttempts}/${MAX_INITIALIZATION_ATTEMPTS})`);
          
          // Set a short timeout before retrying
          setTimeout(() => {
            if (stripeInitialized === false) {
              initializeStripe(true);
            }
          }, 2000);
          return;
        }
        
        throw innerError;
      }
    } catch (error) {
      console.error("Failed to initialize Stripe:", error);
      setError("Failed to initialize payment system. You can still browse the site.");
    } finally {
      setLoading(false);
    }
  };
  
  // Force reinitialize Stripe if there were previous errors
  useEffect(() => {
    if (error || timeoutError) {
      console.log("Attempting to reinitialize Stripe due to previous errors");
    }
  }, [error, timeoutError]);
  
  // Initialize on component mount
  useEffect(() => {
    console.log("StripeProvider mounting, client secret:", clientSecret ? "Present" : "Not present");
    
    let isMounted = true;
    let timeoutId: number | undefined;
    
    // Safe initialization with error handling
    try {
      initializeStripe();
    } catch (err) {
      console.error("Failed to start Stripe initialization:", err);
    }
    
    // Set a timeout to detect if Stripe is taking too long to initialize
    // Increased from 15 seconds to 30 seconds
    timeoutId = window.setTimeout(() => {
      if (!stripeInitialized && isMounted) {
        console.warn("Stripe initialization timeout reached after 30 seconds");
        setTimeoutError(true);
        setLoading(false);
      }
    }, 30000); // 30 seconds timeout (increased from 15)
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      console.log("StripeProvider unmounting, cleaning up");
    };
  }, []); // Only run once on mount

  // Log when client secret changes
  useEffect(() => {
    console.log("Client secret changed:", clientSecret ? "Present" : "Not present");
    
    // Reset loading state when client secret changes to ensure elements are properly initialized
    if (clientSecret && stripeInitialized) {
      setLoading(true);
      // Give Elements time to initialize with the new secret
      // Increased from 2s to 5s
      setTimeout(() => setLoading(false), 5000);
    }
  }, [clientSecret, stripeInitialized]);
  
  const handleRetry = () => {
    toast({
      title: "Retrying connection",
      description: "Attempting to reconnect to the payment system...",
    });
    stripeInitializationAttempts = 0;
    initializeStripe(true);
  };
  
  // If there's an error, show a user-friendly message but don't block rendering
  if (error || timeoutError) {
    const errorMessage = timeoutError 
      ? "The payment system is taking too long to respond."
      : error;
      
    return (
      <ErrorBoundary>
        <div className="flex justify-center items-center p-8 flex-col space-y-4">
          <AlertCircle className="h-8 w-8 text-amber-500" />
          <p className="text-amber-500 font-medium">{errorMessage}</p>
          <p className="text-sm text-muted-foreground">You can still browse the site</p>
          <Button 
            onClick={handleRetry}
            className="px-4 py-2 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </Button>
        </div>
      </ErrorBoundary>
    );
  }

  if (loading || !stripeInitialized) {
    return (
      <ErrorBoundary>
        <div className="flex justify-center items-center p-8 flex-col space-y-4">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">
            Initializing payment system...
          </p>
          <p className="text-xs text-muted-foreground">
            This may take a few seconds. Please wait.
          </p>
        </div>
      </ErrorBoundary>
    );
  }

  if (!clientSecret) {
    console.warn("Client secret is missing, cannot initialize Stripe Elements");
    return (
      <ErrorBoundary>
        <div className="flex justify-center items-center p-8 flex-col space-y-4">
          <AlertCircle className="h-8 w-8 text-amber-500" />
          <p className="text-amber-500">
            Payment information is not ready.
          </p>
          <Button 
            onClick={handleRetry}
            className="px-4 py-2 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </ErrorBoundary>
    );
  }

  console.log("Rendering Stripe Elements with client secret");

  // Wrap the Elements provider in our error boundary
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
