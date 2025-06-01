import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/stats-cards";
import { StockTable } from "@/components/stock-table";
import { PriceChart } from "@/components/price-chart";
import { NotesSection } from "@/components/notes-section";
import { TelegramPanel } from "@/components/telegram-panel";
import { NewsPanel } from "@/components/news-panel";
import { AddStockModal } from "@/components/add-stock-modal";
import { StockDetailsModal } from "@/components/stock-details-modal";
import { StockPriceChart } from "@/components/stock-price-chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, DollarSign, Link as LinkIcon, Eye, ChartLine, Trash2, Calendar, X } from "lucide-react";
import { Link } from "wouter";
import type { StockWithLatestPrice, StockStats } from "@shared/schema";

export default function Dashboard() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string>("");
  
  // Quick EPV Calculator State
  const [quickEarnings, setQuickEarnings] = useState("");
  const [quickCostOfCapital, setQuickCostOfCapital] = useState("9");
  const [quickShares, setQuickShares] = useState("");
  const [quickEpvResult, setQuickEpvResult] = useState<any>(null);
  
  // Stock modal states
  const [selectedStockDetails, setSelectedStockDetails] = useState<{ticker: string, companyName: string} | null>(null);
  const [chartStock, setChartStock] = useState<{ ticker: string; companyName: string } | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Delete stock mutation
  const deleteStockMutation = useMutation({
    mutationFn: async (stockId: number) => {
      return await apiRequest(`/api/stocks/${stockId}`, {
        method: "DELETE",
      });
    },
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

  const handleDeleteStock = (stockId: number) => {
    if (confirm("Are you sure you want to remove this stock from your watchlist?")) {
      deleteStockMutation.mutate(stockId);
    }
  };

  const { data: stocks = [], isLoading: stocksLoading } = useQuery<StockWithLatestPrice[]>({
    queryKey: ["/api/stocks"],
  });

  const { data: stats } = useQuery<StockStats>({
    queryKey: ["/api/stats"],
  });

  const { data: notes = [] } = useQuery<any[]>({
    queryKey: ["/api/notes"],
  });

  // Set default selected stock when stocks load
  if (stocks.length > 0 && !selectedStock) {
    setSelectedStock(stocks[0].ticker);
  }

  const calculateQuickEPV = () => {
    const earnings = parseFloat(quickEarnings);
    const costCap = parseFloat(quickCostOfCapital) / 100;
    const shares = parseFloat(quickShares);

    if (isNaN(earnings) || isNaN(costCap)) {
      return;
    }

    const enterpriseEPV = earnings / costCap;
    let intrinsicValuePerShare = null;

    if (!isNaN(shares) && shares > 0) {
      intrinsicValuePerShare = (enterpriseEPV * 1000000) / shares;
    }

    setQuickEpvResult({
      enterpriseEPV,
      intrinsicValuePerShare,
      costOfCapital: quickCostOfCapital,
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 min-w-0">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-2 md:p-6 mobile-main max-w-full">
          <div className="space-y-4 md:space-y-6">
            <StatsCards stats={stats} />
            
            {/* Top Opportunities Watchlist Preview */}
            <div className="mobile-card">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-red-600" />
                      Top Opportunities
                    </div>
                    <Link href="/watchlist" className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700">
                      <span>See All</span>
                      <LinkIcon className="h-3 w-3" />
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stocksLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : stocks.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-gray-500">No stocks in watchlist</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stocks
                        .filter(stock => stock.marginOfSafety != null)
                        .sort((a, b) => (b.marginOfSafety || 0) - (a.marginOfSafety || 0))
                        .slice(0, 5)
                        .map((stock) => {
                          const marginOfSafety = stock.marginOfSafety || 0;
                          const conviction = Math.min(Math.max(stock.convictionScore || 1, 1), 5);
                          
                          return (
                            <div key={stock.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {stock.ticker.slice(0, 4)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium text-gray-900 truncate">{stock.companyName}</div>
                                    <div className="text-xs text-gray-500">{stock.ticker}</div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-1 flex-shrink-0">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <span key={i} className={`text-xs ${i < conviction ? 'text-yellow-400' : 'text-gray-300'}`}>
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                <div>
                                  <div className="text-gray-500 text-xs uppercase tracking-wide">Price</div>
                                  <div className="font-medium">
                                    {stock.currentPrice ? `$${stock.currentPrice.toFixed(2)}` : 'No data'}
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="text-gray-500 text-xs uppercase tracking-wide">Margin of Safety</div>
                                  <div className={`font-medium ${marginOfSafety >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {marginOfSafety >= 0 ? '+' : ''}{marginOfSafety.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-end space-x-1 pt-2 border-t border-gray-100">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedStockDetails({ ticker: stock.ticker, companyName: stock.companyName })}
                                  className="text-green-600 hover:text-green-700 p-1"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setChartStock({ ticker: stock.ticker, companyName: stock.companyName })}
                                  className="text-blue-600 hover:text-blue-700 p-1"
                                >
                                  <ChartLine className="h-4 w-4" />
                                </Button>
                                <Link href="/price-history">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-purple-600 hover:text-purple-700 p-1"
                                  >
                                    <Calendar className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteStock(stock.id)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  disabled={deleteStockMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick EPV Calculator */}
            <div className="mobile-card">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-red-600" />
                      Quick EPV Calculator
                    </div>
                    <Link href="/tools" className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700">
                      <span>Full Calculator</span>
                      <LinkIcon className="h-3 w-3" />
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quickEarnings">Net Income ($M)</Label>
                      <Input
                        id="quickEarnings"
                        type="number"
                        placeholder="100"
                        value={quickEarnings}
                        onChange={(e) => setQuickEarnings(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quickCost">Cost of Capital</Label>
                      <Select value={quickCostOfCapital} onValueChange={setQuickCostOfCapital}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7% (Optimistic)</SelectItem>
                          <SelectItem value="9">9% (Base Case)</SelectItem>
                          <SelectItem value="10">10% (Conservative)</SelectItem>
                          <SelectItem value="12">12% (High Risk)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quickShares">Shares (M)</Label>
                      <Input
                        id="quickShares"
                        type="number"
                        placeholder="50"
                        value={quickShares}
                        onChange={(e) => setQuickShares(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Button 
                      onClick={calculateQuickEPV} 
                      className="bg-red-600 hover:bg-red-700"
                      disabled={!quickEarnings}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Calculate
                    </Button>
                    
                    {quickEpvResult && (
                      <div className="flex gap-4 items-center">
                        <div className="text-sm">
                          <span className="text-gray-600">Enterprise: </span>
                          <span className="font-bold text-green-700">
                            ${quickEpvResult.enterpriseEPV.toLocaleString('en-US', { maximumFractionDigits: 0 })}M
                          </span>
                        </div>
                        {quickEpvResult.intrinsicValuePerShare && (
                          <div className="text-sm">
                            <span className="text-gray-600">Per Share: </span>
                            <span className="font-bold text-red-700">
                              ${quickEpvResult.intrinsicValuePerShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mobile-grid">
              <div className="mobile-card">
                <PriceChart selectedStock={selectedStock} />
              </div>
              
              <div className="mobile-card">
                <NewsPanel />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mobile-grid">
              <div className="mobile-card">
                <NotesSection notes={notes} />
              </div>
              <div className="mobile-card">
                <TelegramPanel />
              </div>
            </div>
          </div>
        </main>
      </div>

      <AddStockModal 
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
      />
      
      {selectedStockDetails && (
        <StockDetailsModal
          isOpen={!!selectedStockDetails}
          onClose={() => setSelectedStockDetails(null)}
          ticker={selectedStockDetails.ticker}
          companyName={selectedStockDetails.companyName}
        />
      )}

      {chartStock && (
        <Dialog open={!!chartStock} onOpenChange={() => setChartStock(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{chartStock.ticker} - {chartStock.companyName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChartStock(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="h-96">
              <StockPriceChart ticker={chartStock.ticker} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
