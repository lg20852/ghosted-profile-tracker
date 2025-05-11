declare module '@stripe/react-stripe-js';
declare module '@stripe/stripe-js' {
  export interface Stripe {
    // Add basic Stripe interface structure
    elements: (options?: any) => any;
    confirmPayment: (options?: any) => Promise<any>;
    // Other Stripe methods that might be used
  }
  
  export function loadStripe(publishableKey: string): Promise<Stripe | null>;
}
