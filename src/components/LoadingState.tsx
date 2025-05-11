
import React from "react";
import { Loader } from "lucide-react";

const LoadingState = () => {
  console.log("Rendering LoadingState component with enhanced visibility");
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4 min-h-[300px]">
      {[1, 2, 3].map(i => (
        <div 
          key={i} 
          className="animate-pulse flex flex-col items-center p-6 bg-gray-100 rounded-lg border border-gray-200"
        >
          <div className="rounded-full bg-gray-200 h-24 w-24 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          
          {/* Add a visible loading indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/80 p-4 rounded-lg shadow flex items-center space-x-2">
              <Loader className="h-5 w-5 text-black animate-spin" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingState;
