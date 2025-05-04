
import React from "react";
import GhostCard from "./GhostCard";
import { useGhost } from "@/contexts/GhostContext";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ReportForm from "./ReportForm";
import { Button } from "./ui/button";

const GhostGrid = () => {
  const { filteredGhosts, searchTerm, isFiltering, activeFilters } = useGhost();

  // Sort by spook count (descending)
  const sortedGhosts = [...filteredGhosts].sort((a, b) => b.spookCount - a.spookCount);
  
  // Show all ghosts or filtered results
  const displayGhosts = searchTerm || activeFilters.length > 0 ? sortedGhosts : sortedGhosts;
  
  if (isFiltering) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4 min-h-[300px]">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse flex flex-col items-center p-6 bg-gray-100 rounded-lg">
            <div className="rounded-full bg-gray-200 h-24 w-24 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (displayGhosts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">
          {searchTerm || activeFilters.length > 0
            ? `No reports found matching your search criteria. Need to make a report?` 
            : "No reports found yet. Need to make a report?"}
        </h3>
        <p className="mt-2 text-gray-600 mb-4">
          Help others by reporting your ghosting experience
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-black hover:bg-black hover:text-white transition-all">
              Report a Ghosting
            </Button>
          </DialogTrigger>
          <ReportForm />
        </Dialog>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
      {displayGhosts.map(ghost => (
        <GhostCard key={ghost.id} ghost={ghost} />
      ))}
    </div>
  );
};

export default GhostGrid;
