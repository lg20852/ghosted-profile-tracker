
import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { Loader, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Update the TEST publishable key to match your Stripe account
// Make sure this key is from the same Stripe account as your secret key in Supabase secrets
const STRIPE_PUBLISHABLE_KEY = "pk_test_51M1LMF3P4O5RlqN46u13eTMIWRr6FfSnofNSN8eWJ4WT80pDcGehWrRdvTJdY6yzyPQuGftxR1OSXDUchNHyXVOH00hDmLycZZ";

// Initialize Stripe outside component to prevent multiple instances
let stripePromise: Promise<Stripe | null>;

interface StripeProviderProps {
  clientSecret: string | null;
  children: React.ReactNode;
}

const getStripe = () => {
  if (!stripePromise) {
    console.log("Initializing Stripe with publishable key");
    
    // Validate the key format (should start with pk_)
    if (!STRIPE_PUBLISHABLE_KEY.startsWith("pk_")) {
      console.error("Invalid Stripe publishable key format. Keys should start with 'pk_'");
    }
    
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

const StripeProvider: React.FC<StripeProviderProps> = ({ clientSecret, children }) => {
  const [loading, setLoading] = useState(true);
  const [stripeInitialized, setStripeInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeoutError, setTimeoutError] = useState(false);
  const { toast } = useToast();
  
  // Force reinitialize Stripe if there were previous errors
  useEffect(() => {
    if (error || timeoutError) {
      console.log("Attempting to reinitialize Stripe due to previous errors");
      stripePromise = null; // Reset the promise to force new initialization
    }
  }, [error, timeoutError]);
  
  useEffect(() => {
    console.log("StripeProvider mounting, client secret:", clientSecret ? "Present" : "Not present");
    
    let isMounted = true;
    let timeoutId: number | undefined;
    
    // Initialize Stripe instance
    const initializeStripe = async () => {
      try {
        console.log("Starting Stripe initialization");
        const stripe = await getStripe();
        console.log("Stripe initialization result:", stripe ? "Success" : "Failed");
        
        if (!isMounted) return;
        
        if (!stripe) {
          throw new Error("Failed to initialize Stripe");
        }
        
        console.log("Stripe initialized successfully");
        setStripeInitialized(true);
        setTimeoutError(false);
        setError(null);
      } catch (error) {
        console.error("Failed to initialize Stripe:", error);
        if (!isMounted) return;
        
        setError("Failed to initialize payment system. Please try again later.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Set a timeout to detect if Stripe is taking too long to initialize
    timeoutId = window.setTimeout(() => {
      if (!stripeInitialized && isMounted) {
        console.warn("Stripe initialization timeout reached after 8 seconds");
        setTimeoutError(true);
        setLoading(false);
      }
    }, 8000); // 8 seconds timeout

    initializeStripe();
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      console.log("StripeProvider unmounting, cleaning up");
    };
  }, [stripeInitialized]);

  // Log when client secret changes
  useEffect(() => {
    console.log("Client secret changed:", clientSecret ? "Present" : "Not present");
    
    // Reset loading state when client secret changes to ensure elements are properly initialized
    if (clientSecret) {
      setLoading(true);
      setTimeout(() => setLoading(false), 1000); // Give a brief moment for Elements to initialize with the new secret
    }
  }, [clientSecret]);
  
  if (error || timeoutError) {
    const errorMessage = timeoutError 
      ? "The payment system is taking too long to respond. Please try again."
      : error;
      
    return (
      <div className="flex justify-center items-center p-8 flex-col space-y-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-red-500 font-medium">{errorMessage}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Retry
        </button>
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
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Retry
        </button>
      </div>
    );
  }

  console.log("Rendering Stripe Elements with client secret");

  return (
    <Elements
      stripe={getStripe()}
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
