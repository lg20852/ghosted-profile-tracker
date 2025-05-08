
import React from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReportForm from "@/components/ReportForm";

const HowItWorks = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container max-w-[800px] mx-auto py-20 px-6 flex-grow">
        {/* Intro Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">How It Works</h1>
          <p className="text-lg text-gray-600">
            Reporting ghosting is simple and fair. Here's how we verify reports and help make hiring better.
          </p>
        </div>
        
        {/* Step-by-Step Section */}
        <div className="space-y-12">
          {/* Step 1 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                1
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Include Us in Your Follow-Up</h2>
                <p className="text-gray-700 mb-2">
                  Send a polite follow-up email to the recruiter and add <a href="mailto:support@ghosted.app" className="text-black underline">support@ghosted.app</a> in the <strong>To</strong> field. We'll monitor for a reply — no reply means it's recorded.
                </p>
                <p className="text-sm text-gray-500">
                  We must be in the 'To' line — not CC'd.
                </p>
              </div>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                2
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Wait 5 Business Days</h2>
                <p className="text-gray-700">
                  Give them five full business days to respond. If they don't, we log it as a verified ghosting automatically on day six.
                </p>
              </div>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                3
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Get Paid if the Employer Compensates</h2>
                <p className="text-gray-700 mb-2">
                  If the employer chooses to pay the no-show fee, you'll receive <strong>$500</strong> — because your time deserves respect.
                </p>
                <p className="text-sm text-gray-500">
                  Note: Payment is optional and made by the employer, not by Ghosted.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg">
                Report a Ghosting
              </Button>
            </DialogTrigger>
            <ReportForm />
          </Dialog>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;
