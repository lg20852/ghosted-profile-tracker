
import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { Loader } from "lucide-react";

// Using the test publishable key
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
  
  useEffect(() => {
    // Initialize Stripe instance
    const initializeStripe = async () => {
      try {
        const stripe = await getStripe();
        if (!stripe) {
          throw new Error("Failed to initialize Stripe");
        }
        setStripeInitialized(true);
      } catch (error) {
        console.error("Failed to initialize Stripe:", error);
        setError("Failed to initialize payment system. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    initializeStripe();
  }, []);

  if (error) {
    return (
      <div className="flex justify-center items-center p-8 flex-col space-y-4">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading || !stripeInitialized || !clientSecret) {
    return (
      <div className="flex justify-center items-center p-8 flex-col space-y-4">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">
          {!stripeInitialized ? "Initializing payment system..." : "Loading payment form..."}
        </p>
      </div>
    );
  }

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
