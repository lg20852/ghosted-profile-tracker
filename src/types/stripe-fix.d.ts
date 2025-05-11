
declare module '@stripe/react-stripe-js' {
  import React from 'react';
  import { Stripe } from '@stripe/stripe-js';
  
  export interface ElementsContextValue {
    elements: any;
    stripe: Stripe | null;
  }
  
  export function Elements(props: {
    stripe: Promise<Stripe | null>;
    options?: any;
    children: React.ReactNode;
  }): JSX.Element;
  
  export function useStripe(): Stripe | null;
  export function useElements(): any;
  export function PaymentElement(props: any): JSX.Element;
  export function CardElement(props: any): JSX.Element;
  export function CardNumberElement(props: any): JSX.Element;
  export function CardExpiryElement(props: any): JSX.Element;
  export function CardCvcElement(props: any): JSX.Element;
}

declare module '@stripe/stripe-js' {
  export interface Stripe {
    elements: (options?: any) => any;
    confirmPayment: (options?: any) => Promise<any>;
    confirmCardPayment: (clientSecret: string, options?: any) => Promise<any>;
    confirmSetup: (options?: any) => Promise<any>;
    retrievePaymentIntent: (clientSecret: string) => Promise<any>;
    retrieveSetupIntent: (clientSecret: string) => Promise<any>;
    paymentRequest: (options?: any) => any;
    handleCardAction: (clientSecret: string) => Promise<any>;
  }
  
  export function loadStripe(publishableKey: string): Promise<Stripe | null>;
}
