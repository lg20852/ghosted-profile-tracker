
import React from "react";
import GhostCard from "./GhostCard";
import { useGhost } from "@/contexts/GhostContext";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ReportForm from "./ReportForm";
import { Button } from "./ui/button";

const GhostGrid = () => {
  const { filteredGhosts, searchTerm } = useGhost();

  // Sort by spook count (descending)
  const sortedGhosts = [...filteredGhosts].sort((a, b) => b.spookCount - a.spookCount);
  
  // Show all ghosts
  const displayGhosts = searchTerm ? sortedGhosts : sortedGhosts;
  
  if (displayGhosts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">
          {searchTerm 
            ? `No ghosts found matching "${searchTerm}". Want to go first?` 
            : "No ghosts reported yet. Want to be the first?"}
        </h3>
        <p className="mt-2 text-gray-600 mb-4">
          Help others by reporting your ghosting experience
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-black hover:bg-black hover:text-white transition-all">
              Report a Ghost
            </Button>
          </DialogTrigger>
          <ReportForm />
        </Dialog>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayGhosts.map(ghost => (
        <GhostCard key={ghost.id} ghost={ghost} />
      ))}
    </div>
  );
};

export default GhostGrid;
