import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { ReddSpinner } from "@/components/ui/redd-spinner";
import Dashboard from "@/pages/dashboard";
import Watchlist from "@/pages/watchlist";
import Portfolio from "@/pages/portfolio";
import Markets from "@/pages/markets";
import SECFilings from "@/pages/sec-filings";
import Tools from "@/pages/tools";
import Analytics from "@/pages/analytics";
import Notes from "@/pages/notes";
import PriceHistory from "@/pages/price-history";
import Telegram from "@/pages/telegram";
import Settings from "@/pages/settings";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ReddSpinner size="lg" />
      </div>
    );
  }

  return (
    <Switch>
      {isAuthenticated ? (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/watchlist" component={Watchlist} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/markets" component={Markets} />
          <Route path="/sec-filings" component={SECFilings} />
          <Route path="/tools" component={Tools} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/notes" component={Notes} />
          <Route path="/price-history" component={PriceHistory} />
          <Route path="/telegram" component={Telegram} />
          <Route path="/settings" component={Settings} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
        </>
      ) : (
        <>
          <Route path="/" component={Login} />
          <Route path="/login" component={Login} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="redd-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
