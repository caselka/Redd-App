import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AddStockModal } from "@/components/add-stock-modal";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, TrendingUp, TrendingDown } from "lucide-react";

interface MarketStock {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  price?: number;
  change?: number;
}

export default function Markets() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExchange, setSelectedExchange] = useState("ALL");

  const { data: marketData = [], isLoading } = useQuery<MarketStock[]>({
    queryKey: ["/api/markets"],
  });

  const filteredStocks = marketData.filter((stock: MarketStock) => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExchange = selectedExchange === "ALL" || stock.exchange === selectedExchange;
    return matchesSearch && matchesExchange;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-3 md:p-6 pt-16 md:pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Market Explorer</h1>
            <p className="text-gray-600">Browse all NASDAQ and NYSE listed companies</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by symbol or company name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedExchange === "ALL" ? "default" : "outline"}
                    onClick={() => setSelectedExchange("ALL")}
                    className={selectedExchange === "ALL" ? "bg-brand-blue" : ""}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedExchange === "NASDAQ" ? "default" : "outline"}
                    onClick={() => setSelectedExchange("NASDAQ")}
                    className={selectedExchange === "NASDAQ" ? "bg-brand-blue" : ""}
                  >
                    NASDAQ
                  </Button>
                  <Button
                    variant={selectedExchange === "NYSE" ? "default" : "outline"}
                    onClick={() => setSelectedExchange("NYSE")}
                    className={selectedExchange === "NYSE" ? "bg-brand-blue" : ""}
                  >
                    NYSE
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-brand-blue mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading market data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exchange</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStocks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          {searchTerm ? "No stocks match your search" : "Market data will be loaded from external API"}
                        </td>
                      </tr>
                    ) : (
                      filteredStocks.slice(0, 50).map((stock: MarketStock) => (
                        <tr key={stock.symbol} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white text-xs font-bold mr-3">
                                {stock.symbol.slice(0, 2)}
                              </div>
                              <span className="font-medium text-gray-900">{stock.symbol}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{stock.name}</div>
                            <div className="text-sm text-gray-500">{stock.sector}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className="text-xs">
                              {stock.exchange}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {stock.price ? `$${stock.price.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {stock.change !== undefined ? (
                              <div className={`flex items-center ${stock.change >= 0 ? 'text-profit-green' : 'text-loss-red'}`}>
                                {stock.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                                <span className="text-sm">
                                  {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Watch
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
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