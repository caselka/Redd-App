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
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, DollarSign, Link as LinkIcon } from "lucide-react";
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
            
            <div className="mobile-card">
              <StockTable 
                stocks={stocks} 
                isLoading={stocksLoading}
                onSelectStock={() => {}} // No longer needed since we have dedicated buttons
              />
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
    </div>
  );
}
