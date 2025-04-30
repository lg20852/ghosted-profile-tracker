
import React from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { GhostProfile } from "@/types";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface GhostCardProps {
  ghost: GhostProfile;
}

const GhostCard: React.FC<GhostCardProps> = ({ ghost }) => {
  const handleVenmoPayment = () => {
    // In a real app, this would use the actual Venmo handle from env variables
    window.open(
      `venmo://paycharge?txn=pay&recipients=@ghostedsupport&amount=25&note=No-show fee for ${ghost.name}`,
      "_blank"
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={ghost.photoURL} alt={ghost.name} />
          <AvatarFallback>{ghost.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <h3 className="font-bold text-xl mb-2">{ghost.name}</h3>
        
        <div className="text-gray-600 mb-4">
          <p className="font-medium">Ghosted {ghost.spookCount} candidates</p>
          <p className="text-sm">Last reported: {format(ghost.lastSeen, 'yyyy-MM-dd')}</p>
        </div>
        
        <Button 
          variant="outline" 
          className="border-black hover:bg-black hover:text-white transition-all"
          onClick={handleVenmoPayment}
        >
          Pay $25 via Venmo
        </Button>
        <p className="text-xs mt-2 text-gray-500">$20 to candidates, $5 to platform</p>
      </CardContent>
    </Card>
  );
};

export default GhostCard;
