
import React from "react";
import GhostCard from "./GhostCard";
import { useGhost } from "@/contexts/ghost";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ReportForm from "./ReportForm";
import { Button } from "./ui/button";
import LoadingState from "./LoadingState";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const GhostGrid = () => {
  const { filteredGhosts, searchTerm, isFiltering, activeFilters, isLoading, error } = useGhost();

  // Debug logging
  console.log("GhostGrid rendering", {
    ghostCount: filteredGhosts.length,
    isLoading,
    isFiltering,
    hasError: !!error
  });
  
  // Sort by spook count (descending)
  const sortedGhosts = [...filteredGhosts].sort((a, b) => b.spookCount - a.spookCount);
  
  if (isLoading) {
    console.log("Showing loading state");
    return <LoadingState />;
  }
  
  if (error) {
    console.log("Showing error state:", error);
    return (
      <div className="text-center py-12">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <p className="mt-2 text-gray-600">
          Please add a report to get started.
        </p>
        <div className="mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-black hover:bg-black hover:text-white transition-all">
                Report a Ghosting
              </Button>
            </DialogTrigger>
            <ReportForm />
          </Dialog>
        </div>
      </div>
    );
  }
  
  if (isFiltering) {
    console.log("Showing filtering state");
    return <LoadingState />;
  }
  
  if (sortedGhosts.length === 0) {
    console.log("No ghosts found");
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

  console.log("Rendering ghost cards:", sortedGhosts.length);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
      {sortedGhosts.map(ghost => (
        <GhostCard key={ghost.id} ghost={ghost} />
      ))}
    </div>
  );
};

export default GhostGrid;
