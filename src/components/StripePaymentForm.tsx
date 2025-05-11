
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
  const [isElementsReady, setIsElementsReady] = useState(false);
  const [elementLoading, setElementLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<CheckoutStep>("details");
  const { toast } = useToast();

  // Calculate progress based on active step
  const progressPercentage = 
    activeStep === "details" ? 33 :
    activeStep === "payment" ? 66 :
    100;

  useEffect(() => {
    // Check if elements are ready
    const checkElementsReady = () => {
      if (!elements) {
        console.log("Elements not available yet");
        return;
      }
      
      const paymentElement = elements.getElement("payment");
      if (paymentElement) {
        console.log("Payment element is available");
        setIsElementsReady(true);
        setElementLoading(false);
      } else {
        console.log("Payment element not ready yet");
      }
    };

    // Check initially
    checkElementsReady();
    
    // Add a ready event listener
    const readyCheck = setInterval(checkElementsReady, 1000);
    
    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      if (!isElementsReady) {
        console.log("Elements initialization timed out");
        setElementLoading(false);
        setErrorMessage("Payment form initialization timed out. Please try again.");
      }
      clearInterval(readyCheck);
    }, 10000);

    return () => {
      clearInterval(readyCheck);
      clearTimeout(timeout);
    };
  }, [elements, isElementsReady]);

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Payment submission started");

    if (!stripe || !elements || !isElementsReady) {
      // Don't allow submission until stripe and elements are fully loaded
      const errorMsg = "Payment processing is still initializing. Please wait a moment.";
      console.error(errorMsg);
      setErrorMessage(errorMsg);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      console.log("Submitting payment elements");
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error("Elements submission error:", submitError);
        throw submitError;
      }

      console.log("Confirming payment with Stripe");
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout-success`,
        },
        redirect: "if_required",
      });

      console.log("Payment confirmation response:", { error, paymentIntent });

      if (error) {
        console.error("Payment error:", error);
        setPaymentStatus("error");
        
        // More specific error messages based on the error type
        const errorMsg = error.type === "card_error" 
          ? error.message || "Your card was declined. Please try another payment method."
          : error.type === "validation_error"
          ? "Please check your card information and try again."
          : "There was a problem processing your payment.";
          
        setErrorMessage(errorMsg);
        
        toast({
          title: "Payment Failed",
          description: errorMsg,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded
        console.log("Payment successful");
        setPaymentStatus("success");
        setActiveStep("success");
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
        setTimeout(() => onSuccess(), 2000);
      } else {
        // Handle other payment intent statuses
        console.log("Payment status:", paymentIntent?.status);
        const statusMessage = paymentIntent
          ? `Payment status: ${paymentIntent.status}. Please wait for confirmation.`
          : "Payment is being processed. We'll update you when it's complete.";
        
        setErrorMessage(statusMessage);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setPaymentStatus("error");
      setErrorMessage((error as any)?.message || "An unexpected error occurred.");
      toast({
        title: "Error",
        description: (error as any)?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToPayment = () => {
    if (!elements || !isElementsReady) {
      setErrorMessage("Payment form is still loading. Please wait a moment.");
      return;
    }
    setActiveStep("payment");
  };

  const handleRetry = () => {
    setErrorMessage(null);
    setPaymentStatus("idle");
    if (activeStep === "payment") {
      // Reset payment element
      const paymentElement = elements?.getElement("payment");
      if (paymentElement) {
        try {
          paymentElement.clear();
        } catch (e) {
          console.error("Failed to clear payment element:", e);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
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
              <Button 
                onClick={handleProceedToPayment}
                disabled={!isElementsReady}
              >
                {isElementsReady ? (
                  <>
                    Continue to Payment
                    <CreditCard className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {activeStep === "payment" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
                <div className="flex items-center gap-2 mb-6 text-sm">
                  <Info size={16} className="text-blue-500" />
                  <span>Enter your card details below to complete the payment</span>
                </div>
                
                <div className="bg-muted/30 p-5 rounded-md border">
                  {elementLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader className="mr-2 h-5 w-5 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading payment form...</span>
                    </div>
                  ) : (
                    <PaymentElement 
                      options={{
                        layout: { type: 'tabs', defaultCollapsed: false },
                      }}
                      onReady={() => {
                        console.log("PaymentElement ready event fired");
                        setElementLoading(false);
                        setIsElementsReady(true);
                      }}
                      onLoaderStart={() => {
                        console.log("PaymentElement loader started");
                      }}
                    />
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
              
              <div className="flex justify-between pt-2">
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
                    disabled={!stripe || !elements || isProcessing || !isElementsReady || elementLoading || paymentStatus === "success"}
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
            </CardContent>
          </Card>
          
          <div className="text-xs text-center text-muted-foreground">
            By clicking "Pay", you agree to the settlement terms and conditions
          </div>
        </form>
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
