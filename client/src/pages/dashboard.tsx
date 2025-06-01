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

  const { data: notes = [] } = useQuery({
    queryKey: ["/api/notes"],
  });

  // Set default selected stock when stocks load
  if (stocks.length > 0 && !selectedStock) {
    setSelectedStock(stocks[0].ticker);
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 p-3 md:p-6 pt-16 md:pt-6 overflow-y-auto">
          <StatsCards stats={stats} />
          
          <StockTable 
            stocks={stocks} 
            isLoading={stocksLoading}
            onSelectStock={setSelectedStock}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-8">
            <PriceChart selectedStock={selectedStock} />
            
            <NewsPanel />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <NotesSection notes={notes} />
            <TelegramPanel />
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
