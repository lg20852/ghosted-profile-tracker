
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GhostGrid from "@/components/GhostGrid";
import SearchBar from "@/components/SearchBar";
import { useGhost } from "@/contexts/GhostContext";
import { Ghost } from "lucide-react";

const Index = () => {
  const { searchTerm } = useGhost();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container max-w-5xl mx-auto py-8 px-6 flex-grow">
        {/* Hero Section with Updated Copy and Ghost Icon */}
        <div className="mb-10 relative">
          <div className="absolute -top-6 left-0 md:left-0">
            <Ghost className="h-14 w-14 text-gray-700 opacity-70 animate-float" />
          </div>
          
          <div className="text-center pt-10 md:pt-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Report Recruiter Ghosting. Help Others Avoid the Same.</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              If you were ghosted after an interview, report it here. Search public reports and get compensated.
            </p>
          </div>
        </div>

        <SearchBar />
        
        {!searchTerm && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Reported Recruiters and Companies</h2>
          </div>
        )}
        
        <GhostGrid />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
