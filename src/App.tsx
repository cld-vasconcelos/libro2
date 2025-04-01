
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import AppRoutes from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <AppRoutes />
          <Toaster />
          <Sonner />
        </div>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
