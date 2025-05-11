
import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Loader } from "lucide-react";

// Replace with your publishable key when in production
const STRIPE_PUBLISHABLE_KEY = "pk_test_51OP0huDgYNiY9m3cRsjrOOuKrsOGkRLmJHQOVw1TiIb6pf8GIghDx5GSTXUF5U8kyCdAW4ej97d15ROUWqBrt0EQ00Aiedb1af";

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
