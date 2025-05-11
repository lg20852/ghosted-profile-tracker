
import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { Loader, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

// Update the LIVE publishable key to match your Stripe account
// Make sure this key is from the same Stripe account as your secret key in Supabase secrets
const STRIPE_PUBLISHABLE_KEY = "pk_live_51RN3k4Al4XSYcvLdnHh8glThz1Dr2A25On1lFDlJ8iYSg9B2ITGhGu4XcFEiDSoPJS8q72N82Sh1c5wJknXxtiRE00YfUlkcnI";

// Initialize Stripe outside component to prevent multiple instances
let stripePromise: Promise<Stripe | null>;
let stripeInitializationAttempts = 0;
const MAX_INITIALIZATION_ATTEMPTS = 3;

interface StripeProviderProps {
  clientSecret: string | null;
  children: React.ReactNode;
}

const getStripe = async (forceRefresh = false): Promise<Stripe | null> => {
  if (forceRefresh || !stripePromise) {
    console.log(`Initializing Stripe with publishable key (attempt ${stripeInitializationAttempts + 1})`);
    
    // Reset the promise if forcing refresh
    if (forceRefresh) {
      stripePromise = null;
    }
    
    // Validate the key format (should start with pk_)
    if (!STRIPE_PUBLISHABLE_KEY.startsWith("pk_")) {
      console.error("Invalid Stripe publishable key format. Keys should start with 'pk_'");
      return null;
    }
    
    stripeInitializationAttempts++;
    
    try {
      stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
      const stripe = await stripePromise;
      
      if (!stripe) {
        console.error("Stripe initialization returned null");
        return null;
      }
      
      console.log("Stripe initialized successfully");
      stripeInitializationAttempts = 0; // Reset attempts counter on success
      return stripe;
    } catch (error) {
      console.error("Error initializing Stripe:", error);
      stripePromise = null;
      return null;
    }
  }
  
  return stripePromise;
};

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
      const newStripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
      setStripeInstance(newStripePromise);
      
      // Still resolve the promise to check for errors, but don't store the result
      const stripe = await newStripePromise;
      
      if (!stripe) {
        throw new Error("Failed to initialize Stripe");
      }
      
      console.log("Stripe initialized successfully");
      setStripeInitialized(true);
      setTimeoutError(false);
      setError(null);
    } catch (error) {
      console.error("Failed to initialize Stripe:", error);
      
      if (stripeInitializationAttempts < MAX_INITIALIZATION_ATTEMPTS) {
        console.log(`Retrying Stripe initialization (attempt ${stripeInitializationAttempts + 1}/${MAX_INITIALIZATION_ATTEMPTS})`);
        // Wait before retrying
        setTimeout(() => initializeStripe(true), 1000);
        return;
      }
      
      setError("Failed to initialize payment system. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // Force reinitialize Stripe if there were previous errors
  useEffect(() => {
    if (error || timeoutError) {
      console.log("Attempting to reinitialize Stripe due to previous errors");
      stripePromise = null; // Reset the promise to force new initialization
    }
  }, [error, timeoutError]);
  
  // Initialize on component mount
  useEffect(() => {
    console.log("StripeProvider mounting, client secret:", clientSecret ? "Present" : "Not present");
    
    let isMounted = true;
    let timeoutId: number | undefined;
    
    initializeStripe();
    
    // Set a timeout to detect if Stripe is taking too long to initialize
    // Increased to 15 seconds for production environments
    timeoutId = window.setTimeout(() => {
      if (!stripeInitialized && isMounted) {
        console.warn("Stripe initialization timeout reached after 15 seconds");
        setTimeoutError(true);
        setLoading(false);
      }
    }, 15000); // 15 seconds timeout for production
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
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
      setTimeout(() => setLoading(false), 2000);
    }
  }, [clientSecret, stripeInitialized]);
  
  const handleRetry = () => {
    toast({
      title: "Retrying connection",
      description: "Attempting to reconnect to the payment system...",
    });
    initializeStripe(true);
  };
  
  if (error || timeoutError) {
    const errorMessage = timeoutError 
      ? "The payment system is taking too long to respond. Please try again."
      : error;
      
    return (
      <div className="flex justify-center items-center p-8 flex-col space-y-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-red-500 font-medium">{errorMessage}</p>
        <Button 
          onClick={handleRetry}
          className="px-4 py-2 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </Button>
      </div>
    );
  }

  if (loading || !stripeInitialized) {
    return (
      <div className="flex justify-center items-center p-8 flex-col space-y-4">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">
          Initializing payment system...
        </p>
        <p className="text-xs text-muted-foreground">
          This may take a few seconds. Please wait.
        </p>
      </div>
    );
  }

  if (!clientSecret) {
    console.warn("Client secret is missing, cannot initialize Stripe Elements");
    return (
      <div className="flex justify-center items-center p-8 flex-col space-y-4">
        <AlertCircle className="h-8 w-8 text-amber-500" />
        <p className="text-amber-500">
          Payment information is not ready. Please try again.
        </p>
        <Button 
          onClick={handleRetry}
          className="px-4 py-2 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  console.log("Rendering Stripe Elements with client secret");

  // Pass the stripePromise directly instead of the resolved Stripe instance
  return (
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
  );
};

export default StripeProvider;
