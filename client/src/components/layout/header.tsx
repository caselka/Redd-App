import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Link } from "wouter";

interface HeaderProps {
  onAddStock: () => void;
}

export function Header({ onAddStock }: HeaderProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [location] = useLocation();

  const updatePricesMutation = useMutation({
    mutationFn: () => apiRequest("/api/prices/update", {
      method: "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stocks"] });
      toast({
        title: "Success",
        description: "Price data updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update prices",
        variant: "destructive",
      });
    },
  });

  const getPageTitle = () => {
    switch (location) {
      case '/':
        return "Dashboard";
      case '/watchlist':
        return "Watchlist";
      case '/portfolio':
        return "Portfolio";
      case '/markets':
        return "Market Explorer";
      case '/sec-filings':
        return "SEC Filings";
      case '/tools':
        return "Investment Tools";
      case '/analytics':
        return "Analytics";
      case '/notes':
        return "Investment Notes";
      case '/price-history':
        return "Price History";
      case '/telegram':
        return "Telegram Bot";
      case '/settings':
        return "Settings";
      default:
        return "Redd";
    }
  };

  const getPageDescription = () => {
    switch (location) {
      case '/':
        return "Monitor your portfolio and track market opportunities";
      case '/watchlist':
        return "Track your favorite stocks and investment opportunities";
      case '/portfolio':
        return "Manage your investment holdings and performance";
      case '/markets':
        return "Browse all NASDAQ and NYSE listed companies";
      case '/sec-filings':
        return "Access SEC filing documents and reports";
      case '/tools':
        return "Investment analysis and valuation tools";
      case '/analytics':
        return "Portfolio performance and market analysis";
      case '/notes':
        return "Your investment research and notes";
      case '/price-history':
        return "Historical price data for tracked stocks";
      case '/telegram':
        return "Configure price alerts and notifications";
      case '/settings':
        return "Account preferences and configuration";
      default:
        return "Investment tracking platform";
    }
  };

  const title = getPageTitle();

  return (
    <header className="bg-white border-b border-gray-200 px-3 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="pl-16 md:pl-0">
          {/* Desktop: Show logo and title */}
          <Link href="/" className="hidden md:flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-charcoal-red rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">R</span>
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-charcoal-red">{title}</h2>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">{getPageDescription()}</p>
            </div>
          </Link>
          
          {/* Mobile: Show only centered title */}
          <div className="md:hidden flex justify-center w-full">
            <h2 className="text-lg font-bold text-neutral-blue-grey text-center">{title}</h2>
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
            <div className="w-2 h-2 bg-profit-green rounded-full animate-pulse-slow"></div>
            <span className="text-sm text-gray-700">Live Data</span>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => updatePricesMutation.mutate()}
            disabled={updatePricesMutation.isPending}
            className="border-neutral-blue-grey text-neutral-blue-grey hover:bg-neutral-blue-grey hover:text-white transition-all duration-200 hidden md:flex"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${updatePricesMutation.isPending ? 'animate-spin' : ''}`} />
            Update Prices
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => updatePricesMutation.mutate()}
            disabled={updatePricesMutation.isPending}
            className="border-neutral-blue-grey text-neutral-blue-grey hover:bg-neutral-blue-grey hover:text-white transition-all duration-200 md:hidden"
          >
            <RefreshCw className={`h-4 w-4 ${updatePricesMutation.isPending ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={onAddStock} size="sm" className="bg-charcoal-red hover:bg-charcoal-red/90 text-white transition-all duration-200 shadow-sm">
            <Plus className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Add Stock</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
