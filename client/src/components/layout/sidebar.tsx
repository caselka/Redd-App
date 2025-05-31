import { ChartLine, List, BarChart3, StickyNote, MessageSquare, TrendingUp, Building2, FileText, Calculator, Briefcase } from "lucide-react";
import { Link, useLocation } from "wouter";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: TrendingUp, label: "Dashboard" },
    { path: "/watchlist", icon: List, label: "Watchlist" },
    { path: "/portfolio", icon: Briefcase, label: "Portfolio" },
    { path: "/markets", icon: Building2, label: "Markets" },
    { path: "/sec-filings", icon: FileText, label: "SEC Filings" },
    { path: "/tools", icon: Calculator, label: "Tools" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/notes", icon: StickyNote, label: "Notes" },
    { path: "/telegram", icon: MessageSquare, label: "Telegram Bot" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center">
              <ChartLine className="text-white text-lg" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Redd</h1>
              <p className="text-sm text-gray-500">Investment Tracker</p>
            </div>
          </div>
        </Link>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    isActive 
                      ? "bg-brand-blue text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}>
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
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
