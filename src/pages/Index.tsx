
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GhostGrid from "@/components/GhostGrid";
import SearchBar from "@/components/SearchBar";
import { useGhost } from "@/contexts/GhostContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ReportForm from "@/components/ReportForm";

const Index = () => {
  const { searchTerm } = useGhost();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container max-w-5xl mx-auto py-8 px-6 flex-grow">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold mb-3">Holding Recruiters Accountable for Ghosting</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search ghosting reports. Share your experience. If verified, receive $500 from the employer.
          </p>
          
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 px-8 py-2 text-lg">
                  Report a Ghosting
                </Button>
              </DialogTrigger>
              <ReportForm />
            </Dialog>
            
            <Button variant="outline" className="w-full sm:w-auto border-black hover:bg-black hover:text-white transition-all px-8 py-2 text-lg">
              Browse Reports
            </Button>
          </div>
        </div>

        <SearchBar />
        
        {!searchTerm && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Recent Reports</h2>
          </div>
        )}
        
        <GhostGrid />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
