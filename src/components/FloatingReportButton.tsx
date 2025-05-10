
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const FloatingReportButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isMobile || !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link to="/how-it-works">
        <Button 
          className="bg-black text-white rounded-full shadow-lg px-6 py-5 hover:bg-gray-800"
          size="lg"
        >
          Report a Ghosting
        </Button>
      </Link>
    </div>
  );
};

export default FloatingReportButton;
