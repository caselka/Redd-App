import { ChartLine, List, BarChart3, StickyNote, MessageSquare, TrendingUp } from "lucide-react";

export function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center">
            <ChartLine className="text-white text-lg" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">InvestBot</h1>
            <p className="text-sm text-gray-500">Assistant</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-brand-blue text-white">
              <TrendingUp size={20} />
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <List size={20} />
              <span>Watchlist</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <BarChart3 size={20} />
              <span>Analytics</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <StickyNote size={20} />
              <span>Notes</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <MessageSquare size={20} />
              <span>Telegram Bot</span>
            </a>
          </li>
        </ul>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm">👤</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Investor</p>
            <p className="text-xs text-gray-500">Premium Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
