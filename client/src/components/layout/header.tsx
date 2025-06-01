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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Investment Dashboard</h2>
          <p className="text-sm text-gray-500">Monitor your portfolio and track market opportunities</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
            <div className="w-2 h-2 bg-profit-green rounded-full animate-pulse-slow"></div>
            <span className="text-sm text-gray-700">Live Data</span>
          </div>
          <Button 
            variant="outline"
            onClick={() => updatePricesMutation.mutate()}
            disabled={updatePricesMutation.isPending}
            className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${updatePricesMutation.isPending ? 'animate-spin' : ''}`} />
            Update Prices
          </Button>
          <Button onClick={onAddStock} className="bg-brand-blue hover:bg-red-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>
    </header>
  );
}
