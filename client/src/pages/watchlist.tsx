import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StockTable } from "@/components/stock-table";
import { AddStockModal } from "@/components/add-stock-modal";
import { useQuery } from "@tanstack/react-query";
import type { StockWithLatestPrice } from "@shared/schema";

export default function Watchlist() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);

  const { data: stocks = [], isLoading: stocksLoading } = useQuery<StockWithLatestPrice[]>({
    queryKey: ["/api/stocks"],
  });

  return (
    <div className="flex h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-2 md:p-6 pt-16 md:pt-6 mobile-main max-w-full">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Watchlist</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor your tracked stocks and their performance</p>
          </div>

          <StockTable 
            stocks={stocks} 
            isLoading={stocksLoading}
            onSelectStock={() => {}}
          />
        </main>
      </div>

      <AddStockModal 
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
      />
    </div>
  );
}