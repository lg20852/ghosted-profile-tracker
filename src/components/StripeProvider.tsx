
import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { Loader, AlertCircle } from "lucide-react";

// Using the test publishable key (make sure this is a test key, not a live key)
const STRIPE_PUBLISHABLE_KEY = "pk_test_51RN3k4Al4XSYcvLdnHh8glThzxaBUMvO0WhQvyzqPGKLhYBkQ2NwJwlMPJCCadBs5pEgj0PqJm9Gh4hbNHLYUM6500JCk0ToNe";

// Initialize Stripe outside component to prevent multiple instances
let stripePromise: Promise<Stripe | null>;

interface StripeProviderProps {
  clientSecret: string | null;
  children: React.ReactNode;
}

const getStripe = () => {
  if (!stripePromise) {
    console.log("Initializing Stripe with key:", STRIPE_PUBLISHABLE_KEY);
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

const StripeProvider: React.FC<StripeProviderProps> = ({ clientSecret, children }) => {
  const [loading, setLoading] = useState(true);
  const [stripeInitialized, setStripeInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeoutError, setTimeoutError] = useState(false);
  
  useEffect(() => {
    // Initialize Stripe instance
    const initializeStripe = async () => {
      try {
        console.log("Starting Stripe initialization");
        const stripe = await getStripe();
        if (!stripe) {
          throw new Error("Failed to initialize Stripe");
        }
        console.log("Stripe initialized successfully");
        setStripeInitialized(true);
      } catch (error) {
        console.error("Failed to initialize Stripe:", error);
        setError("Failed to initialize payment system. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    // Set a timeout to detect if Stripe is taking too long to initialize
    const timeoutId = setTimeout(() => {
      if (!stripeInitialized) {
        console.warn("Stripe initialization timeout reached");
        setTimeoutError(true);
      }
    }, 10000); // 10 seconds timeout

    initializeStripe();
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Log when client secret changes
  useEffect(() => {
    console.log("Client secret changed:", clientSecret ? "Present" : "Not present");
  }, [clientSecret]);
  
  if (error || timeoutError) {
    const errorMessage = timeoutError 
      ? "The payment system is taking too long to respond. Please try again."
      : error;
      
    return (
      <div className="flex justify-center items-center p-8 flex-col space-y-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-red-500">{errorMessage}</p>
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

  // Added more logging
  console.log("Rendering Stripe Elements with client secret:", clientSecret ? "Valid" : "Invalid");

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
