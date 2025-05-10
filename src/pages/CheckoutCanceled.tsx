
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CheckoutCanceled = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container max-w-5xl mx-auto py-20 px-6 flex-grow text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Payment Canceled</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your settlement payment was canceled. No charges were made to your account.
          </p>
          <div className="space-y-4">
            <Link to="/">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg font-medium w-full">
                Return to Homepage
              </Button>
            </Link>
            <p className="text-sm text-gray-500">
              If you have any questions about the settlement process, please <a href="mailto:support@ghosted.app" className="underline">contact our support team</a>.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutCanceled;
