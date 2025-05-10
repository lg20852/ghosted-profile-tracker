
import React, { useRef } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GhostGrid from "@/components/GhostGrid";
import SearchBar from "@/components/SearchBar";
import { useGhost } from "@/contexts/ghost/GhostContext"; 
import { Button } from "@/components/ui/button";
import FloatingReportButton from "@/components/FloatingReportButton";
import LoadingState from "@/components/LoadingState";

const Index = () => {
  const {
    searchTerm,
    isLoading
  } = useGhost();
  const searchSectionRef = useRef<HTMLDivElement>(null);
  
  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container max-w-5xl mx-auto py-8 px-6 flex-grow">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Hold Recruiters Accountable for Ghosting</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">Search reports of ghosting by company. Share your experience. Each verified report qualifies for $500 employer-paid compensation.</p>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/how-it-works">
              <Button className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg">
                Report a Ghosting
              </Button>
            </Link>
            
            <Button variant="outline" className="w-full sm:w-auto border-black hover:bg-black hover:text-white px-8 py-6 text-lg" onClick={scrollToSearch}>
              Browse Reports
            </Button>
          </div>
        </div>

        <div ref={searchSectionRef} className="py-6 border-t border-gray-100 bg-gray-50 -mx-6 px-6">
          <SearchBar />
          
          {!isLoading && !searchTerm && (
            <div className="mb-4 mt-8">
              <h2 className="text-2xl font-semibold mb-2">Recent Reports</h2>
            </div>
          )}
          
          <GhostGrid />
        </div>
      </main>
      
      <Footer />
      <FloatingReportButton />
    </div>
  );
};

export default Index;
