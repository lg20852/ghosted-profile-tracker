
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

const StripeProvider: React.FC<StripeProviderProps> = ({ clientSecret, children }) => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!stripePromise) {
      stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    }
    setLoading(false);
  }, []);

  if (loading || !clientSecret) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading payment form...</span>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#000000',
            colorBackground: '#ffffff',
            colorText: '#30313d',
          },
        },
      }}
    >
      {children}
    </Elements>
  );
};

export default StripeProvider;
