import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { StockWithLatestPrice, PriceHistory } from "@shared/schema";

export default function PriceHistory() {
  const [selectedTicker, setSelectedTicker] = useState<string>("");

  const { data: stocks = [], isLoading: stocksLoading } = useQuery<StockWithLatestPrice[]>({
    queryKey: ["/api/stocks"],
  });

  const selectedStock = stocks.find(s => s.ticker === selectedTicker);

  const { data: priceHistory = [], isLoading: historyLoading } = useQuery<PriceHistory[]>({
    queryKey: [`/api/stocks/${selectedStock?.id}/prices`],
    enabled: !!selectedTicker && !!selectedStock,
  });

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '$0.00';
    return `$${numPrice.toFixed(2)}`;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Price History</h1>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Historical Prices</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Stock</label>
            <Select value={selectedTicker} onValueChange={setSelectedTicker}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a stock from your watchlist" />
              </SelectTrigger>
              <SelectContent>
                {stocks.map((stock) => (
                  <SelectItem key={stock.id} value={stock.ticker}>
                    {stock.ticker} - {stock.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTicker && (
            <div className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedStock?.companyName} ({selectedTicker})
                </h3>
                {selectedStock?.currentPrice && (
                  <p className="text-sm text-gray-600">
                    Current Price: {formatPrice(selectedStock.currentPrice)}
                  </p>
                )}
              </div>

              {historyLoading ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : priceHistory.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-100 rounded-lg font-semibold text-sm text-gray-700">
                    <div>Date</div>
                    <div className="text-right">Closing Price</div>
                  </div>
                  <div className="max-h-96 overflow-y-auto space-y-1">
                    {priceHistory.map((entry, index) => {
                      const prevPrice = index < priceHistory.length - 1 ? parseFloat(priceHistory[index + 1].price) : null;
                      const currentPrice = parseFloat(entry.price);
                      const isUp = prevPrice ? currentPrice > prevPrice : false;
                      const isDown = prevPrice ? currentPrice < prevPrice : false;

                      return (
                        <div 
                          key={entry.id} 
                          className="grid grid-cols-2 gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="text-sm text-gray-700">
                            {entry.timestamp ? formatDate(entry.timestamp) : 'N/A'}
                          </div>
                          <div className={`text-right font-medium ${
                            isUp ? 'text-green-600' : isDown ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {formatPrice(entry.price)}
                            {prevPrice && (
                              <span className="ml-2 text-xs">
                                {isUp ? '↗' : isDown ? '↘' : '→'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No price history available for this stock</p>
                </div>
              )}
            </div>
          )}

          {!selectedTicker && (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">View Price History</h3>
              <p>Select a stock from your watchlist to see its historical closing prices</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}