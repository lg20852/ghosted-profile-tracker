
import React, { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "./ui/button";
import { Loader, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StripePaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  amount: number;
  ghostName: string;
}

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
  const { toast } = useToast();

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout-success`,
        },
        redirect: "if_required", // Attempt to handle payment without redirection
      });

      if (error) {
        console.error("Payment error:", error);
        setPaymentStatus("error");
        toast({
          title: "Payment Failed",
          description: error.message || "There was a problem processing your payment.",
          variant: "destructive",
        });
      } else {
        // Payment succeeded
        setPaymentStatus("success");
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
        setTimeout(() => onSuccess(), 2000); // Navigate after showing success message
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setPaymentStatus("error");
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold mb-1">
          Settlement Payment for {ghostName}
        </h3>
        <p className="text-gray-500">Amount: {formattedAmount}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <PaymentElement />
      </div>

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing || paymentStatus === "success"}
          className="relative"
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
          ) : paymentStatus === "error" ? (
            <>
              <AlertCircle className="mr-2 h-4 w-4" />
              Retry Payment
            </>
          ) : (
            "Pay Now"
          )}
        </Button>
      </div>

      <div className="text-xs text-center text-gray-500 mt-4">
        Payments processed securely by Stripe
      </div>
    </form>
  );
};

export default StripePaymentForm;
