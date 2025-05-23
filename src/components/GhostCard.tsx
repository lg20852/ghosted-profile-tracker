import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { GhostProfile } from "@/types";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Calendar, AlertTriangle, Flame, Loader, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import StripeProvider from "./StripeProvider";
import StripePaymentForm from "./StripePaymentForm";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "./ui/alert";
import ErrorBoundary from "./ErrorBoundary";

interface GhostCardProps {
  ghost: GhostProfile;
}

// Custom error message component
const PaymentErrorMessage = ({ error, onRetry }: { error: string | null, onRetry: () => void }) => (
  <div className="text-center space-y-4 py-4">
    <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
    <h3 className="font-medium">Payment Error</h3>
    <p className="text-sm text-muted-foreground">{error || "Failed to initialize payment"}</p>
    <Alert className="mt-4 border-amber-200 bg-amber-50 text-amber-900">
      <AlertDescription className="text-sm">
        This is a demo app. Make sure you have set up the correct Stripe secret key (starting with sk_) in the Supabase edge function secrets, and that it matches your publishable key's account.
      </AlertDescription>
    </Alert>
    <div className="flex justify-center pt-4">
      <Button onClick={onRetry}>
        Try Again
      </Button>
    </div>
  </div>
);

const GhostCard: React.FC<GhostCardProps> = ({ ghost }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePaymentInitiation = async () => {
    setIsLoading(true);
    setPaymentError(null);
    
    try {
      // Calculate settlement amount based on the number of reported ghostings
      const settlementAmount = ghost.spookCount * 500;
      
      console.log("Creating payment intent for:", ghost.name, "Amount:", settlementAmount);
      
      // Improved error handling with more detailed logging
      const { data, error } = await Promise.race([
        supabase.functions.invoke('create-checkout', {
          body: {
            amount: settlementAmount,
            ghostName: ghost.name,
            companyName: ghost.company,
            spookCount: ghost.spookCount
          }
        }),
        new Promise<{data: null, error: { message: string }}>((resolve) => {
          // Add a timeout to prevent hanging if the API call takes too long
          setTimeout(() => {
            resolve({
              data: null, 
              error: { message: "Payment service took too long to respond. Please try again." }
            });
          }, 10000);
        })
      ]);

      if (error) {
        console.error("Supabase function error:", error);
        
        // More detailed error handling for common issues
        if (error.message?.includes("401") || error.message?.includes("unauthorized")) {
          setPaymentError("Authentication error: Please check that you're properly logged in, or try refreshing the page.");
          
          toast({
            title: "Authentication Error",
            description: "There was a problem authenticating your request. Please try refreshing the page.",
            variant: "destructive"
          });
        } else if (error.message?.includes("non-2xx status code")) {
          // Specific error for Stripe secret key issues
          setPaymentError("Payment service returned an error. Make sure your Stripe secret key (starts with sk_) is correctly configured in Supabase secrets.");
          
          // Show toast with instructions
          toast({
            title: "Stripe Configuration Error",
            description: "Please check that your Stripe secret key is set correctly in Supabase secrets.",
            variant: "destructive"
          });
        } else {
          setPaymentError(error.message || "Failed to initialize payment");
        }
        
        // Don't throw, just log the error
        console.error("Payment initiation failed:", error.message);
      } else if (data?.clientSecret) {
        // Store the client secret and open the dialog
        setClientSecret(data.clientSecret);
        setDialogOpen(true);
      } else {
        // Check if there's an error message in the response
        if (data?.error) {
          setPaymentError(data.error);
          console.error("Payment error from response:", data.error);
        } else {
          console.error("No client secret returned in the data");
          setPaymentError("No client secret returned from payment service");
        }
      }
    } catch (error) {
      // This should only catch unexpected errors that weren't handled above
      console.error('Unexpected error creating payment intent:', error);
      setPaymentError(error.message || "An unexpected error occurred. Please try again.");
      
      toast({
        title: "Payment Error",
        description: "We encountered an unexpected issue. Please try again later.",
        variant: "destructive"
      });
    } finally {
      // Always reset loading state regardless of success or failure
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Optional: Clear client secret when dialog is closed
    setTimeout(() => {
      setClientSecret(null);
    }, 300); // Small delay to allow dialog close animation to complete
  };

  const handlePaymentSuccess = () => {
    setDialogOpen(false);
    navigate("/checkout-success");
  };

  const handlePaymentCancel = () => {
    setDialogOpen(false);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setPaymentError(null);
    handlePaymentInitiation();
  };

  // Use company name as the main display
  const displayName = ghost.company || ghost.name;

  // Get initials for avatar fallback
  const initials = displayName.substring(0, 2).toUpperCase();

  // Generate a stock building/office image for the company
  // This will give us a consistent but unique image per company
  const companyImageId = Math.abs(displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10) + 1;
  const stockImageId = ["photo-1487958449943-2429e8be8625", "photo-1518005020951-eccb494ad742", "photo-1496307653780-42ee777d4833", "photo-1431576901776-e539bd916ba2", "photo-1449157291145-7efd050a4d0e", "photo-1459767129954-1b1c1f9b9ace", "photo-1460574283810-2aab119d8511", "photo-1551038247-3d9af20df552", "photo-1524230572899-a752b3835840", "photo-1493397212122-2b85dda8106b"][companyImageId - 1];
  const companyImageUrl = `https://images.unsplash.com/${stockImageId}?auto=format&fit=crop&w=300&h=300&q=80`;

  // Determine if this is a frequent or repeat offender
  const isFrequentOffender = ghost.spookCount >= 3;
  const isRepeatOffender = ghost.spookCount >= 5;

  // Calculate settlement amount based on the number of reported ghostings
  const settlementAmount = ghost.spookCount * 500;
  const formattedSettlementAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(settlementAmount);
  
  return (
    <ErrorBoundary>
      <Card className="overflow-hidden hover:shadow-md transition-all hover:translate-y-[-3px] cursor-pointer">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={companyImageUrl} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <h3 className="font-bold text-xl mb-2">{displayName}</h3>
          
          <div className="text-gray-600 mb-6 space-y-2 w-full">
            <div className="flex items-center justify-center w-full">
              {isFrequentOffender ? <Flame size={16} className={cn("flex-shrink-0 mr-2 animate-[wiggle_1s_ease-in-out_infinite]", isRepeatOffender ? "text-orange-500" : "text-amber-500")} /> : <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mr-2" />}
              <span>Reported {ghost.spookCount} {ghost.spookCount === 1 ? "time" : "times"} for ghosting</span>
            </div>
            <div className="flex items-center justify-center w-full">
              <Calendar size={14} className="flex-shrink-0 mr-2" />
              <span>Last report: {format(ghost.lastSeen, 'yyyy-MM-dd')}</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="border-black hover:bg-black hover:text-white transition-all w-full" 
            onClick={handlePaymentInitiation}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Settle Report – {formattedSettlementAmount}</span>
              </>
            )}
          </Button>
          <p className="text-xs mt-2 text-gray-500">$450 goes to candidate, $50 supports the platform</p>
          
          <a href="mailto:support@ghosted.app?subject=Report%20Abuse%20-%20Ghost%20Profile" className="text-xs mt-4 text-gray-400 hover:underline">
            Report abuse
          </a>
        </CardContent>
      </Card>
      
      {/* Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl">Checkout - {displayName}</DialogTitle>
            <DialogDescription>
              Complete your settlement payment
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 pt-2">
            <ErrorBoundary fallback={
              <PaymentErrorMessage 
                error="The payment component encountered an unexpected error." 
                onRetry={handleRetry} 
              />
            }>
              {paymentError ? (
                <PaymentErrorMessage error={paymentError} onRetry={handleRetry} />
              ) : (
                <StripeProvider clientSecret={clientSecret}>
                  <StripePaymentForm 
                    onSuccess={handlePaymentSuccess} 
                    onCancel={handlePaymentCancel}
                    amount={settlementAmount}
                    ghostName={displayName}
                  />
                </StripeProvider>
              )}
            </ErrorBoundary>
          </div>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
};

export default GhostCard;
