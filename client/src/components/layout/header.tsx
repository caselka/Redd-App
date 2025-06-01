import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  onAddStock: () => void;
}

export function Header({ onAddStock }: HeaderProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  return (
    <header className="bg-white border-b border-gray-200 px-3 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="pl-12 md:pl-0">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900">Investment Dashboard</h2>
          <p className="text-xs md:text-sm text-gray-500 hidden sm:block">Monitor your portfolio and track market opportunities</p>
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
            className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white hidden md:flex"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${updatePricesMutation.isPending ? 'animate-spin' : ''}`} />
            Update Prices
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => updatePricesMutation.mutate()}
            disabled={updatePricesMutation.isPending}
            className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white md:hidden"
          >
            <RefreshCw className={`h-4 w-4 ${updatePricesMutation.isPending ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={onAddStock} size="sm" className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Add Stock</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
