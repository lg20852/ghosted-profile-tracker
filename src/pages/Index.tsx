
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GhostGrid from "@/components/GhostGrid";
import SearchBar from "@/components/SearchBar";
import { useGhost } from "@/contexts/GhostContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ReportForm from "@/components/ReportForm";
import FloatingReportButton from "@/components/FloatingReportButton";

const Index = () => {
  const { searchTerm } = useGhost();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container max-w-5xl mx-auto py-8 px-6 flex-grow">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Holding Recruiters Accountable for Ghosting</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Search ghosting reports. Share your experience. Verified reports may qualify for $500 employer-paid compensation.
          </p>
          
          <div className="mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg">
                  Report a Ghosting
                </Button>
              </DialogTrigger>
              <ReportForm />
            </Dialog>
          </div>
        </div>

        <div className="py-6 border-t border-gray-100 bg-gray-50 -mx-6 px-6">
          <SearchBar />
          
          {!searchTerm && (
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
