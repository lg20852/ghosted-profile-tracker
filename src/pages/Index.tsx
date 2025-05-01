
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GhostGrid from "@/components/GhostGrid";
import SearchBar from "@/components/SearchBar";
import { useGhost } from "@/contexts/GhostContext";

const Index = () => {
  const { searchTerm } = useGhost();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container max-w-5xl mx-auto py-8 px-6 flex-grow">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold mb-3">Search for Ghosts</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Report ghosting by recruiters or companies. Find out who's gone dark before they waste your time.
          </p>
        </div>

        <SearchBar />
        
        {!searchTerm && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">All Ghosters</h2>
          </div>
        )}
        
        <GhostGrid />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
