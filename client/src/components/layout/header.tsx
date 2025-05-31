import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onAddStock: () => void;
}

export function Header({ onAddStock }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Investment Dashboard</h2>
          <p className="text-sm text-gray-500">Monitor your portfolio and track market opportunities</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
            <div className="w-2 h-2 bg-profit-green rounded-full animate-pulse-slow"></div>
            <span className="text-sm text-gray-700">Live Data</span>
          </div>
          <Button onClick={onAddStock} className="bg-brand-blue hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>
    </header>
  );
}
