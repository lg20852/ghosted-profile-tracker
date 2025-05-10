
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const FloatingReportButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/how-it-works", { state: { scrollToTop: true }});
  };

  if (!isMobile || !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button 
        className="bg-black text-white rounded-full shadow-lg px-6 py-3 hover:bg-gray-800 text-base font-medium"
        size="lg"
        onClick={handleClick}
      >
        Report a Ghosting
      </Button>
    </div>
  );
};

export default FloatingReportButton;
