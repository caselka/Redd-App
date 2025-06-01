import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { NotesSection } from "@/components/notes-section";
import { AddStockModal } from "@/components/add-stock-modal";
import { useQuery } from "@tanstack/react-query";

export default function Notes() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);

  const { data: notes = [] } = useQuery<any[]>({
    queryKey: ["/api/notes"],
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-3 md:p-6 pt-16 md:pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Investment Notes</h1>
            <p className="text-gray-600">Track your investment thoughts and analysis</p>
          </div>

          <NotesSection notes={notes} />
        </main>
      </div>

      <AddStockModal 
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
      />
    </div>
  );
}