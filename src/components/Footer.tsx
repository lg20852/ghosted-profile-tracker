
import React from "react";

const Footer = () => {
  return (
    <footer className="mt-auto py-6 px-6 border-t border-gray-200">
      <div className="container max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-5 h-5 opacity-90"
          >
            <path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"></path>
          </svg>
          <span className="font-medium">Ghosted</span>
        </div>
        
        <div className="text-gray-600 text-sm">
          <p>Contact: support@ghosted.app</p>
        </div>
        
        <div className="text-gray-500 text-xs mt-4 md:mt-0">
          <p>© 2025 Ghosted. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
