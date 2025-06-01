import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useState } from "react";
import { AddStockModal } from "@/components/add-stock-modal";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

interface PortfolioHolding {
  id: number;
  ticker: string;
  companyName: string;
  shares: number;
  avgCostBasis: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export default function Analytics() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);

  const { data: holdings = [] } = useQuery<PortfolioHolding[]>({
    queryKey: ["/api/portfolio"],
  });

  // Calculate portfolio metrics
  const totalValue = holdings.reduce((sum, holding) => sum + (holding.totalValue || 0), 0);
  const totalCost = holdings.reduce((sum, holding) => sum + ((holding.shares || 0) * (holding.avgCostBasis || 0)), 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  const winnersCount = holdings.filter(h => h.gainLoss > 0).length;
  const losersCount = holdings.filter(h => h.gainLoss < 0).length;

  const topPerformer = holdings.length > 0 
    ? holdings.reduce((max, holding) => holding.gainLossPercent > max.gainLossPercent ? holding : max)
    : null;

  const worstPerformer = holdings.length > 0
    ? holdings.reduce((min, holding) => holding.gainLossPercent < min.gainLossPercent ? holding : min)
    : null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-3 md:p-6 pt-16 md:pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Analytics</h1>
            <p className="text-gray-600">Analyze your investment performance and trends</p>
          </div>

          {holdings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Portfolio Data</h3>
              <p className="text-gray-600">Add some holdings to your portfolio to see analytics</p>
            </div>
          ) : (
            <>
              {/* Portfolio Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalValue?.toLocaleString() || '0'}</div>
                    <div className="flex items-center text-sm">
                      {totalGainLoss >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}>
                        {totalGainLossPercent >= 0 ? "+" : ""}{totalGainLossPercent.toFixed(2)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {totalGainLoss >= 0 ? "+" : ""}${totalGainLoss?.toLocaleString() || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">vs cost basis ${totalCost?.toLocaleString() || '0'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Holdings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{holdings.length}</div>
                    <div className="flex space-x-2 text-sm">
                      <span className="text-green-600">{winnersCount} winners</span>
                      <span className="text-red-600">{losersCount} losers</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {holdings.length > 0 ? Math.round((winnersCount / holdings.length) * 100) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">profitable positions</p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {holdings
                        .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
                        .slice(0, 5)
                        .map((holding) => (
                          <div key={holding.id} className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{holding.ticker}</div>
                              <div className="text-sm text-gray-500">{holding.companyName}</div>
                            </div>
                            <div className="text-right">
                              <Badge variant={holding.gainLossPercent >= 0 ? "default" : "destructive"}>
                                {holding.gainLossPercent >= 0 ? "+" : ""}{holding.gainLossPercent.toFixed(2)}%
                              </Badge>
                              <div className="text-sm text-gray-500">
                                ${holding.totalValue?.toLocaleString() || '0'}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Position Allocation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {holdings
                        .sort((a, b) => b.totalValue - a.totalValue)
                        .map((holding) => {
                          const allocation = totalValue > 0 ? (holding.totalValue / totalValue) * 100 : 0;
                          return (
                            <div key={holding.id} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">{holding.ticker}</span>
                                <span>{allocation.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-brand-blue h-2 rounded-full" 
                                  style={{ width: `${allocation}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-500">
                                ${holding.totalValue?.toLocaleString() || '0'} • {holding.shares || 0} shares
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>

      <AddStockModal 
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
      />
    </div>
  );
}