import React, { useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const HowItWorks = () => {
  const { toast } = useToast();
  const emailTemplateRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const topRef = useRef<HTMLDivElement>(null);
  
  // Effect to scroll to top when coming from floating button
  useEffect(() => {
    if (location.state && location.state.scrollToTop) {
      topRef.current?.scrollIntoView({ behavior: "smooth" });
      // Clean up location state to prevent re-scrolling on refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  const copyEmailTemplate = () => {
    if (emailTemplateRef.current) {
      const text = emailTemplateRef.current.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: "Email template copied",
          description: "The follow-up email template has been copied to your clipboard."
        });
      }).catch(err => {
        toast({
          title: "Failed to copy",
          description: "Please try selecting and copying the text manually."
        });
      });
    }
  };
  
  const goToReports = () => {
    navigate('/', { state: { scrollToReports: true } });
  };
  
  return <div className="flex flex-col min-h-screen">
      {/* Invisible reference element for scroll to top - positioned before Header */}
      <div ref={topRef} className="absolute top-0 left-0"></div>
      
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
          
          {/* Sample Follow-up Email Template */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mt-8">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Sample Follow-up Email</h2>
              <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={copyEmailTemplate}>
                <Clipboard size={16} />
                Copy
              </Button>
            </div>
            
            <div ref={emailTemplateRef} className="bg-gray-50 p-5 rounded-md border border-gray-100 font-mono text-sm text-gray-700 whitespace-pre-line">
            {`Subject: Following up on [Position Name] application

Dear [Recruiter's Name],

I hope this email finds you well. I'm writing to follow up on my application for the [Position Name] role at [Company Name] that I interviewed for on [Interview Date].

I enjoyed our conversation about [specific topic discussed during the interview] and remain very interested in the opportunity to join [Company Name] and contribute to [mention a company goal or project discussed].

I understand hiring processes can take time, but I'd appreciate any update you might be able to provide regarding the status of my application or the next steps in the process.

Thank you for your time and consideration.

Best regards,
[Your Name]
[Your Phone Number]
[Your LinkedIn - optional]`}
            </div>
          </div>
          
        </div>
        
        {/* Call to Action - now it scrolls to the reports section on the homepage */}
        <div className="mt-16 text-center">
          <Button 
            className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg"
            onClick={goToReports}
          >
            Browse Reports
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>;
};
export default HowItWorks;
