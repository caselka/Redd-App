import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AddStockModal } from "@/components/add-stock-modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, TrendingUp, TrendingDown, DollarSign, Percent, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const addHoldingSchema = z.object({
  ticker: z.string().min(1, "Ticker is required"),
  companyName: z.string().min(1, "Company name is required"),
  shares: z.string().min(1, "Shares required"),
  purchasePrice: z.string().min(1, "Purchase price required"),
  purchaseDate: z.string().min(1, "Purchase date required"),
  notes: z.string().optional(),
});

type AddHoldingForm = z.infer<typeof addHoldingSchema>;

export default function Portfolio() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isAddHoldingModalOpen, setIsAddHoldingModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: holdings = [], isLoading } = useQuery({
    queryKey: ["/api/portfolio"],
    enabled: isAuthenticated,
  });

  const addHoldingMutation = useMutation({
    mutationFn: async (data: AddHoldingForm) => {
      return await apiRequest("/api/portfolio", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      setIsAddHoldingModalOpen(false);
      toast({
        title: "Success",
        description: "Portfolio holding added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add portfolio holding",
        variant: "destructive",
      });
    },
  });

  const deleteHoldingMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/portfolio/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({
        title: "Success",
        description: "Portfolio holding deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete portfolio holding",
        variant: "destructive",
      });
    },
  });

  const form = useForm<AddHoldingForm>({
    resolver: zodResolver(addHoldingSchema),
    defaultValues: {
      ticker: "",
      companyName: "",
      shares: "",
      purchasePrice: "",
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const onSubmit = (data: AddHoldingForm) => {
    addHoldingMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <Header onAddStock={() => setIsAddStockModalOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-md mx-auto mt-20 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
              <p className="text-gray-600 mb-6">Please log in to view your portfolio</p>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-brand-blue hover:bg-red-700"
              >
                Login with Replit
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Calculate portfolio totals
  const totalValue = holdings.reduce((sum: number, holding: any) => {
    return sum + (holding.totalValue || 0);
  }, 0);

  const totalGainLoss = holdings.reduce((sum: number, holding: any) => {
    return sum + (holding.gainLoss || 0);
  }, 0);

  const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 min-w-0">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 p-2 md:p-6 pt-16 md:pt-6 overflow-y-auto mobile-main max-w-full">
          <div className="mb-6 text-center">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mb-4">Track your stock holdings with live prices</p>
            <Button onClick={() => setIsAddHoldingModalOpen(true)} className="bg-charcoal-red hover:bg-charcoal-red/90 text-white shadow-sm transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Add Holding
            </Button>
          </div>

          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                {totalGainLoss >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${totalGainLoss.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGainLossPercent.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Holdings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-b-2 border-brand-blue mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading portfolio...</p>
                </div>
              ) : holdings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No holdings yet</h3>
                  <p className="text-gray-500 mb-4">Add your first stock holding to start tracking your portfolio</p>
                  <Button onClick={() => setIsAddHoldingModalOpen(true)} className="bg-charcoal-red hover:bg-charcoal-red/90 text-white shadow-sm transition-all duration-200">
                    Add Your First Holding
                  </Button>
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Symbol</th>
                          <th className="text-left p-3">Company</th>
                          <th className="text-right p-3">Shares</th>
                          <th className="text-right p-3">Avg Cost</th>
                          <th className="text-right p-3">Current Price</th>
                          <th className="text-right p-3">Market Value</th>
                          <th className="text-right p-3">Gain/Loss</th>
                          <th className="text-right p-3">Actions</th>
                        </tr>
                      </thead>
                    <tbody>
                      {holdings.map((holding: any) => (
                        <tr key={holding.ticker} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <Badge variant="outline" className="font-mono">
                              {holding.ticker}
                            </Badge>
                          </td>
                          <td className="p-3">{holding.companyName}</td>
                          <td className="p-3 text-right font-medium">{holding.totalShares.toFixed(2)}</td>
                          <td className="p-3 text-right">${holding.weightedAveragePrice.toFixed(2)}</td>
                          <td className="p-3 text-right">
                            {holding.currentPrice > 0 ? `$${holding.currentPrice.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="p-3 text-right font-medium">
                            {holding.currentValue > 0 ? `$${holding.currentValue.toLocaleString()}` : `$${holding.totalCost.toLocaleString()}`}
                          </td>
                          <td className="p-3 text-right">
                            {holding.intrinsicValue ? (
                              <div className="flex flex-col">
                                <span className="text-blue-600">${holding.intrinsicValue.toFixed(2)}</span>
                                {holding.marginOfSafety && (
                                  <span className={`text-xs ${holding.marginOfSafety > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {holding.marginOfSafety.toFixed(1)}% MOS
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">Add to Watchlist</span>
                            )}
                          </td>
                          <td className={`p-3 text-right font-semibold ${holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.currentPrice > 0 ? `$${holding.gainLoss.toLocaleString()}` : '-'}
                          </td>
                          <td className={`p-3 text-right font-semibold ${holding.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.currentPrice > 0 ? `${holding.gainLossPercent.toFixed(1)}%` : '-'}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (holding.transactions && holding.transactions.length > 0) {
                                  // Delete the first transaction for this ticker
                                  deleteHoldingMutation.mutate(holding.transactions[0].id);
                                }
                              }}
                              disabled={deleteHoldingMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete Position
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    </table>
                  </div>
                  
                  {/* Mobile Card Layout */}
                  <div className="md:hidden space-y-4">
                    {holdings.map((holding: any) => (
                      <div key={holding.ticker} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <Badge variant="outline" className="font-mono mb-1">
                              {holding.ticker}
                            </Badge>
                            <div className="text-sm text-gray-600">{holding.companyName}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (holding.transactions && holding.transactions.length > 0) {
                                // Delete the first transaction for this ticker
                                deleteHoldingMutation.mutate(holding.transactions[0].id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-gray-500">Shares</div>
                            <div className="font-medium">{holding.shares}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Current Price</div>
                            <div className="font-medium">${holding.currentPrice?.toFixed(2) || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Market Value</div>
                            <div className="font-medium">${holding.totalValue?.toLocaleString() || '0'}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Gain/Loss</div>
                            <div className={`font-medium ${(holding.gainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(holding.gainLoss || 0) >= 0 ? '+' : ''}${holding.gainLoss?.toFixed(2) || '0'}
                              <span className="text-xs ml-1">
                                ({(holding.gainLossPercent || 0) >= 0 ? '+' : ''}{holding.gainLossPercent?.toFixed(1) || '0'}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Add Holding Modal */}
      {isAddHoldingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Portfolio Holding</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="ticker">Stock Symbol</Label>
                <Input
                  id="ticker"
                  {...form.register("ticker")}
                  placeholder="e.g., AAPL"
                  className="uppercase"
                />
                {form.formState.errors.ticker && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.ticker.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  {...form.register("companyName")}
                  placeholder="e.g., Apple Inc."
                />
                {form.formState.errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="shares">Number of Shares</Label>
                <Input
                  id="shares"
                  type="number"
                  step="0.000001"
                  {...form.register("shares")}
                  placeholder="e.g., 100"
                />
                {form.formState.errors.shares && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.shares.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="purchasePrice">Purchase Price per Share</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  {...form.register("purchasePrice")}
                  placeholder="e.g., 150.00"
                />
                {form.formState.errors.purchasePrice && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.purchasePrice.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  {...form.register("purchaseDate")}
                />
                {form.formState.errors.purchaseDate && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.purchaseDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  {...form.register("notes")}
                  placeholder="e.g., Strong quarter results"
                />
                {form.formState.errors.notes && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.notes.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddHoldingModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addHoldingMutation.isPending}
                  className="bg-charcoal-red hover:bg-charcoal-red/90 text-white shadow-sm transition-all duration-200"
                >
                  {addHoldingMutation.isPending ? "Adding..." : "Add Holding"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AddStockModal 
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
      />
    </div>
  );
}