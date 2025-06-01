import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

export function WatchlistPerformanceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('5D');

  const { data: stocks = [] } = useQuery<any[]>({
    queryKey: ["/api/stocks"],
  });

  // Fetch historical data for all stocks for the selected period
  const { data: historicalData = {} } = useQuery({
    queryKey: ["/api/watchlist-historical", selectedPeriod],
    enabled: stocks.length > 0,
  });

  // Calculate period-based performance from historical data
  const stockPerformances = historicalData && typeof historicalData === 'object' 
    ? Object.entries(historicalData).map(([ticker, data]: [string, any]) => ({
        ticker,
        periodReturn: data.periodReturn || 0,
        currentPrice: data.currentPrice || 0,
        startPrice: data.startPrice || 0,
      }))
    : [];

  const totalStocks = stockPerformances.length;
  const gainers = stockPerformances.filter(stock => stock.periodReturn > 0).length;
  const losers = stockPerformances.filter(stock => stock.periodReturn < 0).length;
  const unchanged = totalStocks - gainers - losers;

  // Calculate average performance for the selected period
  const avgPerformance = stockPerformances.length > 0 
    ? stockPerformances.reduce((sum, stock) => sum + stock.periodReturn, 0) / stockPerformances.length
    : 0;

  useEffect(() => {
    const loadChart = async () => {
      if (!canvasRef.current || stocks.length === 0) return;

      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // Dynamic import of Chart.js
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Prepare data for the chart - showing individual stock performance
      const stockLabels = stocks.map(stock => stock.ticker);
      const performanceData = stocks.map(stock => stock.changePercent || 0);
      const marginOfSafetyData = stocks.map(stock => stock.marginOfSafety || 0);

      // Color coding based on performance
      const backgroundColors = performanceData.map(value => {
        if (value > 0) return 'rgba(34, 197, 94, 0.8)'; // Green for gains
        if (value < 0) return 'rgba(239, 68, 68, 0.8)'; // Red for losses
        return 'rgba(156, 163, 175, 0.8)'; // Gray for no change
      });

      const borderColors = performanceData.map(value => {
        if (value > 0) return 'rgb(34, 197, 94)';
        if (value < 0) return 'rgb(239, 68, 68)';
        return 'rgb(156, 163, 175)';
      });

      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: stockLabels,
          datasets: [
            {
              label: 'Daily Change (%)',
              data: performanceData,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 2,
              borderRadius: 4,
              borderSkipped: false,
            },
            {
              label: 'Margin of Safety (%)',
              data: marginOfSafetyData,
              type: 'line',
              borderColor: '#D72638',
              backgroundColor: 'rgba(215, 38, 56, 0.1)',
              borderWidth: 2,
              fill: false,
              tension: 0.4,
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12,
                },
              },
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              titleColor: '#1F2937',
              bodyColor: '#1F2937',
              borderColor: '#E5E7EB',
              borderWidth: 1,
              callbacks: {
                label: function(context) {
                  if (context.datasetIndex === 0) {
                    const value = context.parsed.y;
                    return `Daily Change: ${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
                  } else {
                    return `Margin of Safety: ${context.parsed.y.toFixed(1)}%`;
                  }
                }
              }
            },
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
          },
          scales: {
            y: {
              beginAtZero: true,
              position: 'left',
              grid: {
                color: '#F3F4F6',
              },
              ticks: {
                callback: function(value) {
                  return value + '%';
                },
                color: '#6B7280',
                font: {
                  size: 11,
                },
              },
              title: {
                display: true,
                text: 'Daily Change (%)',
                color: '#6B7280',
                font: {
                  size: 12,
                },
              },
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                callback: function(value) {
                  return value + '%';
                },
                color: '#6B7280',
                font: {
                  size: 11,
                },
              },
              title: {
                display: true,
                text: 'Margin of Safety (%)',
                color: '#6B7280',
                font: {
                  size: 12,
                },
              },
            },
            x: {
              grid: {
                color: '#F3F4F6',
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 11,
                },
                maxRotation: 45,
              },
            },
          },
        },
      });
    };

    loadChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [stocks]);

  if (stocks.length === 0) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Watchlist Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div>Add stocks to your watchlist to view performance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Watchlist Performance Overview
            </CardTitle>
            <p className="text-sm text-gray-600">
              Period performance for all watched stocks ({selectedPeriod})
            </p>
          </div>
          
          {/* Time Period Selector */}
          <div className="flex gap-2">
            {['5D', '1M', '3M', '6M', '1Y'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className={`text-xs ${
                  selectedPeriod === period 
                    ? 'bg-brand-red text-white hover:bg-brand-red/90' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Performance Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Total Stocks</div>
            <div className="text-lg font-semibold text-gray-900">{totalStocks}</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600">Gainers</div>
            <div className="text-lg font-semibold text-green-600 flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {gainers}
            </div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-sm text-gray-600">Losers</div>
            <div className="text-lg font-semibold text-red-600 flex items-center justify-center gap-1">
              <TrendingDown className="w-4 h-4" />
              {losers}
            </div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Avg Performance</div>
            <div className={`text-lg font-semibold ${avgPerformance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {avgPerformance >= 0 ? '+' : ''}{avgPerformance.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 relative">
          <canvas ref={canvasRef} />
        </div>
        
        {/* Top Performers */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Top Performer</h4>
            {stocks.length > 0 && (() => {
              const topPerformer = stocks.reduce((max, stock) => 
                (stock.changePercent || 0) > (max.changePercent || 0) ? stock : max
              );
              return (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{topPerformer.ticker}</div>
                    <div className="text-sm text-gray-600">{topPerformer.companyName}</div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    +{(topPerformer.changePercent || 0).toFixed(2)}%
                  </Badge>
                </div>
              );
            })()}
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Worst Performer</h4>
            {stocks.length > 0 && (() => {
              const worstPerformer = stocks.reduce((min, stock) => 
                (stock.changePercent || 0) < (min.changePercent || 0) ? stock : min
              );
              return (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{worstPerformer.ticker}</div>
                    <div className="text-sm text-gray-600">{worstPerformer.companyName}</div>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    {(worstPerformer.changePercent || 0).toFixed(2)}%
                  </Badge>
                </div>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}