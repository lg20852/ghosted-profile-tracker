
declare module '@stripe/react-stripe-js';
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
