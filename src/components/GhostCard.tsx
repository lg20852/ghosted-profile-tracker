
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
      `venmo://paycharge?txn=pay&recipients=@ghostedsupport&amount=500&note=No-show fee for ${ghost.name}`,
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
          <p className="font-medium">Spooked {ghost.spookCount} times</p>
          <p className="text-sm">Last seen: {format(ghost.lastSeen, 'yyyy-MM-dd')}</p>
        </div>
        
        <Button 
          variant="outline" 
          className="border-black hover:bg-black hover:text-white transition-all"
          onClick={handleVenmoPayment}
        >
          Pay $500 via Venmo
        </Button>
        <p className="text-xs mt-2 text-gray-500">$450 goes to victims, $50 supports Ghosted</p>
        
        <a href="#" className="text-xs mt-4 text-gray-400 hover:underline">
          Report abuse
        </a>
      </CardContent>
    </Card>
  );
};

export default GhostCard;
