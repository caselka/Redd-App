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

  const formatDateTime = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '$0.00';
    return `$${numPrice.toFixed(2)}`;
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-background text-foreground">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
        </Link>
        <div className="flex items-center space-x-2 flex-1 justify-center">
          <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-foreground">Price History</h1>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center space-x-1 text-xs">
            <ArrowLeft className="h-3 w-3" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>
      </div>

      <Card className="bg-card text-card-foreground border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span>Historical Prices</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Stock</label>
            <Select value={selectedTicker} onValueChange={setSelectedTicker}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Choose a stock from your watchlist" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
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
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedStock?.companyName} ({selectedTicker})
                </h3>
                {selectedStock?.currentPrice && (
                  <p className="text-sm text-muted-foreground">
                    Current Price: {formatPrice(selectedStock.currentPrice)}
                  </p>
                )}
              </div>

              {historyLoading ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-muted/50 dark:bg-muted/20 rounded-lg">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : priceHistory.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 dark:bg-muted/20 rounded-lg font-semibold text-sm text-muted-foreground">
                    <div>Date & Time</div>
                    <div className="text-right">Price</div>
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
                          className="grid grid-cols-2 gap-4 p-3 bg-card border border-border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className="text-sm text-muted-foreground">
                            {entry.timestamp ? formatDateTime(entry.timestamp) : 'N/A'}
                          </div>
                          <div className={`text-right font-medium ${
                            isUp ? 'text-green-600 dark:text-green-400' : isDown ? 'text-red-600 dark:text-red-400' : 'text-foreground'
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
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p>No price history available for this stock</p>
                </div>
              )}
            </div>
          )}

          {!selectedTicker && (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">View Price History</h3>
              <p>Select a stock from your watchlist to see its historical closing prices</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}