import { useState } from "react";
import { Search, RefreshCw, ChartLine, StickyNote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { StockWithLatestPrice } from "@shared/schema";

interface StockTableProps {
  stocks: StockWithLatestPrice[];
  isLoading: boolean;
  onSelectStock: (ticker: string) => void;
}

export function StockTable({ stocks, isLoading, onSelectStock }: StockTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteStockMutation = useMutation({
    mutationFn: (stockId: number) => apiRequest("DELETE", `/api/stocks/${stockId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stocks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Stock removed from watchlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove stock",
        variant: "destructive",
      });
    },
  });

  const filteredStocks = stocks.filter(stock => 
    stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteStock = (stockId: number) => {
    if (confirm("Are you sure you want to remove this stock from your watchlist?")) {
      deleteStockMutation.mutate(stockId);
    }
  };

  const renderStars = (conviction: number) => {
    return Array.from({ length: 10 }, (_, i) => (
      <span key={i} className={`text-sm ${i < conviction ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Stock Watchlist</h3>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-brand-blue mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading stocks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
      <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Stock Watchlist</h3>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/stocks"] });
              toast({
                title: "Refreshed",
                description: "Stock data updated",
              });
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {filteredStocks.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No stocks in watchlist</h3>
          <p className="text-gray-500">Add your first stock to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intrinsic Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin of Safety</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conviction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStocks.map((stock) => {
                const marginOfSafety = stock.marginOfSafety || 0;
                const mosVariant = marginOfSafety > 0 ? 'profit' : 'loss';
                
                return (
                  <tr key={stock.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">
                          {stock.ticker.slice(0, 4)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{stock.companyName}</div>
                          <div className="text-sm text-gray-500">{stock.ticker}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stock.currentPrice ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">${stock.currentPrice.toFixed(2)}</div>
                          {stock.changePercent && (
                            <div className={`text-sm ${stock.changePercent >= 0 ? 'text-profit-green' : 'text-loss-red'}`}>
                              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">No data</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${parseFloat(stock.intrinsicValue).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={mosVariant === 'profit' ? 'default' : 'destructive'}
                        className={mosVariant === 'profit' ? 'bg-profit-green text-white' : 'bg-loss-red text-white'}
                      >
                        {marginOfSafety >= 0 ? '+' : ''}{marginOfSafety.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex space-x-0.5">
                          {renderStars(stock.convictionScore)}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">{stock.convictionScore}/10</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.lastUpdated 
                        ? new Date(stock.lastUpdated).toLocaleString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectStock(stock.ticker)}
                          className="text-brand-blue hover:text-blue-700"
                        >
                          <ChartLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <StickyNote className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStock(stock.id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={deleteStockMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
