
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const CheckoutSuccess = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container max-w-5xl mx-auto py-20 px-6 flex-grow text-center">
        <div className="max-w-md mx-auto">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your settlement payment. The candidate will be notified and compensated accordingly.
          </p>
          <Link to="/">
            <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg font-medium">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
