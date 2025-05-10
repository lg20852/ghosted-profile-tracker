
import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { GhostProfile } from "@/types";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Calendar, AlertTriangle, Flame, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GhostCardProps {
  ghost: GhostProfile;
}

const GhostCard: React.FC<GhostCardProps> = ({
  ghost
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStripeCheckout = async () => {
    setIsLoading(true);
    try {
      // Calculate settlement amount based on the number of reported ghostings
      const settlementAmount = ghost.spookCount * 500;
      
      console.log("Creating checkout session for:", ghost.name, "Amount:", settlementAmount);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          amount: settlementAmount,
          ghostName: ghost.name,
          companyName: ghost.company,
          spookCount: ghost.spookCount
        }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message);
      }

      console.log("Checkout session created:", data);

      if (data?.url) {
        // Open Stripe checkout in a new tab instead of redirecting
        console.log("Opening URL in new tab:", data.url);
        const newWindow = window.open(data.url, '_blank');
        
        // Handle popup blocking
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          console.warn("Popup was blocked - showing instructions to user");
          toast({
            title: "Popup Blocked",
            description: "Please allow popups for this site and try again, or copy the URL manually.",
            variant: "destructive"
          });
          
          // Provide alternative for users with popup blockers
          navigator.clipboard.writeText(data.url)
            .then(() => {
              toast({
                title: "Checkout URL Copied",
                description: "The checkout URL has been copied to your clipboard. Please paste it in a new tab.",
                duration: 6000,
              });
            })
            .catch(err => {
              console.error("Failed to copy URL:", err);
            });
        }
      } else {
        console.error("No checkout URL returned in the data");
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Checkout Error",
        description: "Failed to initialize checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Always reset loading state regardless of success or failure
      setIsLoading(false);
    }
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
  
  return <Card className="overflow-hidden hover:shadow-md transition-all hover:translate-y-[-3px] cursor-pointer">
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
          onClick={handleStripeCheckout}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            `Settle Report – ${formattedSettlementAmount}`
          )}
        </Button>
        <p className="text-xs mt-2 text-gray-500">$450 goes to candidate, $50 supports the platform</p>
        
        <a href="mailto:support@ghosted.app?subject=Report%20Abuse%20-%20Ghost%20Profile" className="text-xs mt-4 text-gray-400 hover:underline">
          Report abuse
        </a>
      </CardContent>
    </Card>;
};
export default GhostCard;
