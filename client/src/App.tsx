import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Watchlist from "@/pages/watchlist";
import Markets from "@/pages/markets";
import Analytics from "@/pages/analytics";
import Notes from "@/pages/notes";
import Telegram from "@/pages/telegram";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/watchlist" component={Watchlist} />
      <Route path="/markets" component={Markets} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/notes" component={Notes} />
      <Route path="/telegram" component={Telegram} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
