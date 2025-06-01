import { ChartLine, List, BarChart3, StickyNote, MessageSquare, TrendingUp, Building2, FileText, Calculator, Briefcase, Menu, X, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

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

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md border-2 border-brand-blue"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} className="text-brand-blue" /> : <Menu size={20} className="text-brand-blue" />}
        </Button>

        {/* Mobile Sidebar Overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform">
              <div className="p-6 pt-16 border-b border-gray-200">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <div className="flex items-center space-x-3 cursor-pointer">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Redd</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-red-600">Redd</h1>
                      <p className="text-sm text-gray-500">Investment Tracker</p>
                    </div>
                  </div>
                </Link>
              </div>
              
              <nav className="mt-6 pb-20">
                <ul className="space-y-2 px-4">
                  {navItems.map((item) => {
                    const isActive = location === item.path;
                    const Icon = item.icon;
                    
                    return (
                      <li key={item.path}>
                        <Link href={item.path} onClick={() => setIsOpen(false)}>
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
                  
                  {/* Account Management */}
                  <li className="pt-4 border-t border-gray-200">
                    <Link href="/settings" onClick={() => setIsOpen(false)}>
                      <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                        location === "/settings" 
                          ? "bg-brand-blue text-white" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}>
                        <Settings size={20} />
                        <span>Settings</span>
                      </div>
                    </Link>
                  </li>
                  
                  <li>
                    <a href="/api/logout" className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer text-gray-700 hover:bg-gray-100">
                      <LogOut size={20} />
                      <span>Sign Out</span>
                    </a>
                  </li>
                  
                  <li className="pt-4">
                    <div className="px-3 text-center">
                      <p className="text-xs text-gray-400">Built by</p>
                      <p className="text-xs font-medium text-gray-600">Redgum & Birch</p>
                      <p className="text-xs text-gray-400">A subsidiary of Caselka Capital</p>
                    </div>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="hidden md:flex md:flex-col w-64 bg-white shadow-lg border-r border-gray-200 h-screen fixed">
      <div className="p-6 border-b border-gray-200">
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">Redd</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-red-600">Redd</h1>
              <p className="text-sm text-gray-500">Investment Tracker</p>
            </div>
          </div>
        </Link>
      </div>
      
      <nav className="mt-6 flex-1 overflow-y-auto">
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
      
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm">👤</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Investor</p>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Link href="/settings">
              <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                location === "/settings" 
                  ? "bg-brand-blue text-white" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
                <Settings size={16} />
                <span className="text-sm">Settings</span>
              </div>
            </Link>
            
            <a href="/api/logout" className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer text-gray-700 hover:bg-gray-100">
              <LogOut size={16} />
              <span className="text-sm">Sign Out</span>
            </a>
          </div>
          
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">Built by</p>
            <p className="text-xs font-medium text-gray-600 text-center">Redgum & Birch</p>
            <p className="text-xs text-gray-400 text-center">A subsidiary of Caselka Capital</p>
          </div>
        </div>
      </div>
    </div>
  );
}
