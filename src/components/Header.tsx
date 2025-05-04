
import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="border-b border-gray-200 py-4 px-6">
      <div className="flex justify-center md:justify-start">
        <Link to="/" className="flex items-center gap-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-8 h-8 opacity-90 hover:opacity-100 transition-opacity animate-float"
          >
            <path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"></path>
          </svg>
          <span className="text-2xl font-bold">Ghosted</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
