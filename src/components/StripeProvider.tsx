
import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { Loader } from "lucide-react";

// Using the live publishable key
const STRIPE_PUBLISHABLE_KEY = "pk_live_51RN3k4Al4XSYcvLdnHh8glThz1Dr2A25On1lFDlJ8iYSg9B2ITGhGu4XcFEiDSoPJS8q72N82Sh1c5wJknXxtiRE00YfUlkcnI";

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
  
  useEffect(() => {
    // Initialize Stripe instance
    const initializeStripe = async () => {
      try {
        await getStripe();
        setStripeInitialized(true);
      } catch (error) {
        console.error("Failed to initialize Stripe:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeStripe();
  }, []);

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
