
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GhostProvider } from "./contexts/ghost";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCanceled from "./pages/CheckoutCanceled";
import ErrorBoundary from "./components/ErrorBoundary";

// Create a custom error handler for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      // Use a suspense-friendly staleTime to avoid rapid refetches
      staleTime: 60000,
    },
  },
});

// Set up global error handlers using event listeners
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === "observerResultsUpdated") {
    const error = event.query.getObservers().find(o => o.getCurrentResult().error)?.getCurrentResult().error;
    if (error) {
      console.error("React Query error:", error);
    }
  }
});

queryClient.getMutationCache().subscribe((event) => {
  if (event.type === "updated") {
    const error = event.mutation.state.error;
    if (error) {
      console.error("Mutation error:", error);
    }
  }
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <GhostProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <ErrorBoundary>
                  <Index />
                </ErrorBoundary>
              } />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/checkout-success" element={<CheckoutSuccess />} />
              <Route path="/checkout-canceled" element={<CheckoutCanceled />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </GhostProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
