
import React, { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "./ui/button";
import { Loader, CheckCircle, AlertTriangle, ShieldCheck, CreditCard, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "./ui/progress";
import { Card, CardContent } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";

interface StripePaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  amount: number;
  ghostName: string;
}

type CheckoutStep = "details" | "payment" | "success";

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  onSuccess,
  onCancel,
  amount,
  ghostName,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elementReady, setElementReady] = useState(false);
  const [elementLoading, setElementLoading] = useState(true);
  const [elementError, setElementError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<CheckoutStep>("details");
  const { toast } = useToast();

  const progressPercentage = 
    activeStep === "details" ? 33 :
    activeStep === "payment" ? 66 :
    100;

  const isPaymentSystemReady = !!stripe && !!elements && elementReady;

  useEffect(() => {
    console.log("[PaymentForm] System ready state:", { 
      stripe: !!stripe, 
      elements: !!elements, 
      elementReady, 
      elementLoading,
      elementError
    });
  }, [stripe, elements, elementReady, elementLoading, elementError]);

  // Simple element state management
  useEffect(() => {
    if (activeStep === "payment") {
      console.log("[PaymentForm] Payment step activated, waiting for element...");
      setElementLoading(true);
      setElementError(null);
    } else {
      // Reset when leaving payment step
      setElementReady(false);
      setElementLoading(true);
      setElementError(null);
    }
  }, [activeStep]);

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[PaymentForm] Payment submission started");

    if (!isPaymentSystemReady) {
      const errorMsg = "Payment system is not ready. Please wait for the form to load completely.";
      console.error("[PaymentForm]", errorMsg);
      setErrorMessage(errorMsg);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      console.log("[PaymentForm] Submitting payment elements...");
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error("[PaymentForm] Elements submission error:", submitError);
        throw submitError;
      }

      console.log("[PaymentForm] Confirming payment with Stripe...");
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout-success`,
        },
        redirect: "if_required",
      });

      console.log("[PaymentForm] Payment confirmation response:", { 
        error: error?.message, 
        paymentIntentStatus: paymentIntent?.status 
      });

      if (error) {
        console.error("[PaymentForm] Payment error:", error);
        setPaymentStatus("error");
        
        let errorMsg = "There was a problem processing your payment.";
        
        if (error.type === "card_error") {
          errorMsg = error.message || "Your card was declined. Please try another payment method.";
        } else if (error.type === "validation_error") {
          errorMsg = "Please check your card information and try again.";
        } else if (error.message?.includes("network")) {
          errorMsg = "Network error. Please check your connection and try again.";
        }
          
        setErrorMessage(errorMsg);
        
        toast({
          title: "Payment Failed",
          description: errorMsg,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("[PaymentForm] Payment successful!");
        setPaymentStatus("success");
        setActiveStep("success");
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
        setTimeout(() => onSuccess(), 2000);
      } else {
        const statusMessage = paymentIntent
          ? `Payment status: ${paymentIntent.status}. Please wait for confirmation.`
          : "Payment is being processed. We'll update you when it's complete.";
        
        console.log("[PaymentForm] Unexpected payment status:", paymentIntent?.status);
        setErrorMessage(statusMessage);
      }
    } catch (error) {
      console.error("[PaymentForm] Unexpected error:", error);
      setPaymentStatus("error");
      const errorMsg = (error as any)?.message || "An unexpected error occurred.";
      setErrorMessage(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToPayment = () => {
    console.log("[PaymentForm] Proceeding to payment step");
    setActiveStep("payment");
  };

  const handleRetry = () => {
    console.log("[PaymentForm] Retry requested");
    setErrorMessage(null);
    setPaymentStatus("idle");
    setElementError(null);
    setIsProcessing(false);
  };

  const handlePaymentElementReady = () => {
    console.log("[PaymentForm] PaymentElement is ready");
    setElementReady(true);
    setElementLoading(false);
    setElementError(null);
  };

  const handlePaymentElementError = (event: { error: { message: string; } }) => {
    console.error("[PaymentForm] PaymentElement error:", event.error);
    
    let errorMessage = event.error.message;
    
    // Enhanced error handling for common issues
    if (errorMessage.includes("API key")) {
      errorMessage = "Payment configuration error. The Stripe keys may be mismatched or invalid. Please contact support.";
    } else if (errorMessage.includes("network") || errorMessage.includes("connection")) {
      errorMessage = "Network connection issue. Please check your internet connection and try again.";
    }
    
    setElementError(errorMessage);
    setElementLoading(false);
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <div>
        <Progress value={progressPercentage} className="h-2 mb-4" />
        <div className="flex justify-between text-xs text-muted-foreground mb-6">
          <span className={activeStep === "details" ? "font-medium text-primary" : ""}>Order Details</span>
          <span className={activeStep === "payment" ? "font-medium text-primary" : ""}>Payment</span>
          <span className={activeStep === "success" ? "font-medium text-primary" : ""}>Confirmation</span>
        </div>
      </div>

      {activeStep === "details" && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <h3 className="text-2xl font-bold mb-2">Settlement Payment</h3>
              <p className="text-muted-foreground">
                You're about to process a payment to resolve a ghosting incident.
              </p>
              
              <div className="border rounded-lg p-4 w-full bg-muted/30 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Company/Recruiter:</span>
                  <span className="font-medium">{ghostName}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Settlement Amount:</span>
                  <span className="font-bold">{formattedAmount}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Candidate payment:</span>
                  <span>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount * 0.9)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Platform fee:</span>
                  <span>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount * 0.1)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck size={16} className="text-green-500" />
                <span>All payments are securely processed by Stripe</span>
              </div>
            </div>
            
            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleProceedToPayment}>
                Continue to Payment
                <CreditCard className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {activeStep === "payment" && (
        <div className="flex flex-col min-h-0">
          <Card className="flex-1">
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
                <div className="flex items-center gap-2 mb-6 text-sm">
                  <Info size={16} className="text-blue-500" />
                  <span>Enter your card details below to complete the payment</span>
                </div>
                
                <div className="bg-muted/30 p-5 rounded-md border min-h-[300px] flex items-center justify-center">
                  {elementLoading && !elementError && (
                    <div className="flex flex-col justify-center items-center py-8 text-center space-y-2">
                      <Loader className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Loading payment form...
                      </span>
                    </div>
                  )}
                  
                  {elementError && (
                    <div className="flex flex-col justify-center items-center py-8 text-center space-y-3">
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                      <p className="text-red-600 text-sm max-w-md">{elementError}</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRetry}
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                  
                  {!elementError && (
                    <div className={`w-full ${elementLoading ? 'opacity-0 absolute' : ''}`}>
                      <PaymentElement 
                        options={{
                          layout: { type: 'tabs', defaultCollapsed: false },
                        }}
                        onReady={handlePaymentElementReady}
                        onLoadError={handlePaymentElementError}
                        onChange={(event) => {
                          if (event.error) {
                            handlePaymentElementError(event);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                
                {errorMessage && (
                  <Alert className="mt-4 border-red-200 bg-red-50 text-red-900">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 justify-center">
                  <ShieldCheck size={14} className="text-green-500" />
                  <span>Your payment information is encrypted and secure</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Fixed bottom section for buttons */}
          <div className="mt-4 bg-white border-t pt-4 pb-2">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveStep("details")}
                  disabled={isProcessing}
                >
                  Back
                </Button>
                {paymentStatus === "error" ? (
                  <Button
                    type="button"
                    onClick={handleRetry}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!isPaymentSystemReady || isProcessing || paymentStatus === "success" || !!elementError}
                    className="relative min-w-[120px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : paymentStatus === "success" ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Paid
                      </>
                    ) : (
                      <>
                        Pay {formattedAmount}
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <div className="text-xs text-center text-muted-foreground">
                By clicking "Pay", you agree to the settlement terms and conditions
              </div>
            </form>
          </div>
        </div>
      )}
      
      {activeStep === "success" && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground mb-6">
              Your settlement payment has been processed successfully.
            </p>
            <Button onClick={onSuccess} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StripePaymentForm;
