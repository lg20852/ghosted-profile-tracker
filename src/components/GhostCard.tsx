
import React from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { GhostProfile } from "@/types";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Calendar, AlertTriangle } from "lucide-react";

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

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all hover:translate-y-[-3px] cursor-pointer">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={ghost.photoURL} alt={ghost.name} />
          <AvatarFallback>{ghost.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <h3 className="font-bold text-xl mb-4">{ghost.name}</h3>
        
        <div className="text-gray-600 mb-6 space-y-2 w-full">
          <p className="font-medium flex items-center justify-center gap-2">
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
            Reported {ghost.spookCount} times for ghosting
          </p>
          <p className="text-sm flex items-center justify-center gap-2">
            <Calendar size={14} className="flex-shrink-0" />
            Last report: {format(ghost.lastSeen, 'yyyy-MM-dd')}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          className="border-black hover:bg-black hover:text-white transition-all w-full"
          onClick={handleVenmoPayment}
        >
          Settle Report – $500 via Venmo
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
