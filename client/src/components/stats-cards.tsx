import { Eye, TrendingDown, Shield, Star } from "lucide-react";
import type { StockStats } from "@shared/schema";

interface StatsCardsProps {
  stats?: StockStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Total Watched</p>
            <p className="text-xl md:text-3xl font-bold text-gray-900">{stats.totalWatched}</p>
          </div>
          <div className="w-8 h-8 md:w-12 md:h-12 bg-brand-blue bg-opacity-10 rounded-lg flex items-center justify-center">
            <Eye className="text-brand-blue" size={16} />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Undervalued</p>
            <p className="text-xl md:text-3xl font-bold text-profit-green">{stats.undervalued}</p>
          </div>
          <div className="w-8 h-8 md:w-12 md:h-12 bg-profit-green bg-opacity-10 rounded-lg flex items-center justify-center">
            <TrendingDown className="text-profit-green" size={16} />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Avg. MoS</p>
            <p className="text-xl md:text-3xl font-bold text-gray-900">{stats.avgMarginOfSafety.toFixed(1)}%</p>
          </div>
          <div className="w-8 h-8 md:w-12 md:h-12 bg-success-green bg-opacity-10 rounded-lg flex items-center justify-center">
            <Shield className="text-success-green" size={16} />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">High Conviction</p>
            <p className="text-xl md:text-3xl font-bold text-gray-900">{stats.highConviction}</p>
          </div>
          <div className="w-8 h-8 md:w-12 md:h-12 bg-yellow-500 bg-opacity-10 rounded-lg flex items-center justify-center">
            <Star className="text-yellow-500" size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
