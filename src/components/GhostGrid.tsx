
import React from "react";
import GhostCard from "./GhostCard";
import { useGhost } from "@/contexts/GhostContext";

const GhostGrid = () => {
  const { filteredGhosts, searchTerm } = useGhost();

  // Sort by spook count (descending)
  const sortedGhosts = [...filteredGhosts].sort((a, b) => b.spookCount - a.spookCount);
  
  if (sortedGhosts.length === 0 && searchTerm) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">No ghosts found matching "{searchTerm}"</h3>
        <p className="mt-2 text-gray-600">Try a different search term or report this ghost!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedGhosts.map(ghost => (
        <GhostCard key={ghost.id} ghost={ghost} />
      ))}
    </div>
  );
};

export default GhostGrid;
