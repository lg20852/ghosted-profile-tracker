
import React from "react";
import GhostCard from "./GhostCard";
import { useGhost } from "@/contexts/ghost";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ReportForm from "./ReportForm";
import { Button } from "./ui/button";
import LoadingState from "./LoadingState";
import { AlertCircle } from "lucide-react";

const GhostGrid = () => {
  const { filteredGhosts, searchTerm, isFiltering, activeFilters, isLoading, error } = useGhost();

  // Sort by spook count (descending)
  const sortedGhosts = [...filteredGhosts].sort((a, b) => b.spookCount - a.spookCount);
  
  // Show all ghosts or filtered results
  const displayGhosts = searchTerm || activeFilters.length > 0 ? sortedGhosts : sortedGhosts;
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle size={20} />
          <h3 className="text-xl font-medium">
            {error}
          </h3>
        </div>
        <p className="mt-2 text-gray-600">
          We're still showing you data that was previously loaded.
        </p>
      </div>
    );
  }
  
  if (isFiltering) {
    return <LoadingState />;
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
