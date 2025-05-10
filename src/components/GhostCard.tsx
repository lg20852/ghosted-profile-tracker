
import React from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { GhostProfile } from "@/types";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Calendar, AlertTriangle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface GhostCardProps {
  ghost: GhostProfile;
}

const GhostCard: React.FC<GhostCardProps> = ({ ghost }) => {
  const handleVenmoPayment = () => {
    // In a real app, this would use the actual Venmo handle from env variables
    window.open(
      `venmo://paycharge?txn=pay&recipients=@ghostedsupport&amount=500&note=Ghosting Settlement`,
      "_blank"
    );
  };

  // Use company name as the main display
  const displayName = ghost.company || ghost.name;
  
  // Get initials for avatar fallback
  const initials = displayName.substring(0, 2).toUpperCase();

  // Generate a stock building/office image for the company
  // This will give us a consistent but unique image per company
  const companyImageId = Math.abs(displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10) + 1;
  const stockImageId = [
    "photo-1487958449943-2429e8be8625",
    "photo-1518005020951-eccb494ad742",
    "photo-1496307653780-42ee777d4833",
    "photo-1431576901776-e539bd916ba2",
    "photo-1449157291145-7efd050a4d0e",
    "photo-1459767129954-1b1c1f9b9ace",
    "photo-1460574283810-2aab119d8511",
    "photo-1551038247-3d9af20df552",
    "photo-1524230572899-a752b3835840",
    "photo-1493397212122-2b85dda8106b"
  ][companyImageId - 1];
  
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
    <Card className="overflow-hidden hover:shadow-md transition-all hover:translate-y-[-3px] cursor-pointer">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={companyImageUrl} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        
        <h3 className="font-bold text-xl mb-2">{displayName}</h3>
        
        <div className="text-gray-600 mb-6 space-y-2 w-full">
          <div className="flex items-center justify-center w-full">
            {isFrequentOffender ? (
              <Flame 
                size={16} 
                className={cn(
                  "flex-shrink-0 mr-2 animate-[wiggle_1s_ease-in-out_infinite]",
                  isRepeatOffender ? "text-orange-500" : "text-amber-500"
                )} 
              />
            ) : (
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mr-2" />
            )}
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
          onClick={handleVenmoPayment}
        >
          Settle Report – {formattedSettlementAmount}
        </Button>
        <p className="text-xs mt-2 text-gray-500">$450 goes to candidate, $50 supports the platform</p>
        
        <a href="mailto:support@ghosted.app?subject=Report%20Abuse%20-%20Ghost%20Profile" className="text-xs mt-4 text-gray-400 hover:underline">
          Report abuse
        </a>
      </CardContent>
    </Card>
  );
};

export default GhostCard;
