
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useIsMobile();
  
  return (
    <header className="border-b border-gray-200 py-3 md:py-4 px-4 md:px-6">
      <div className="container max-w-5xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-1.5 md:gap-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} opacity-90 hover:opacity-100 transition-opacity ${isMobile ? 'animate-none' : 'animate-float'}`}
          >
            <path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"></path>
          </svg>
          <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>Ghosted</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/how-it-works" className="text-gray-700 hover:text-black transition-colors">
            How It Works
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
