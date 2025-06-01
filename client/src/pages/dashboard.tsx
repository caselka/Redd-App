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
import type { StockWithLatestPrice, StockStats } from "@shared/schema";

export default function Dashboard() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string>("");

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
