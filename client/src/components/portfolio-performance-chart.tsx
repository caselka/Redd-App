import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PortfolioPerformanceChartProps {
  portfolioValue: number;
  totalCost: number;
}

export function PortfolioPerformanceChart({ portfolioValue, totalCost }: PortfolioPerformanceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  // Fetch market index data
  const { data: marketData } = useQuery({
    queryKey: ["/api/market-indices"],
    retry: false,
  });

  // Calculate portfolio performance
  const portfolioReturn = totalCost > 0 ? ((portfolioValue - totalCost) / totalCost) * 100 : 0;

  useEffect(() => {
    const loadChart = async () => {
      if (!canvasRef.current) return;

      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // Dynamic import of Chart.js
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Generate sample data for the last 30 days (in a real app, this would come from your API)
      const labels = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      // Sample performance data (replace with real data from your API)
      const portfolioData = Array.from({ length: 30 }, (_, i) => {
        const baseReturn = portfolioReturn;
        const volatility = Math.sin(i * 0.2) * 2; // Add some realistic volatility
        return baseReturn + volatility;
      });

      const sp500Data = Array.from({ length: 30 }, (_, i) => {
        const baseReturn = 8.5; // S&P 500 average annual return
        const volatility = Math.sin(i * 0.15) * 1.5;
        return (baseReturn / 12) + volatility; // Monthly return
      });

      const dowData = Array.from({ length: 30 }, (_, i) => {
        const baseReturn = 7.8; // Dow Jones average annual return
        const volatility = Math.sin(i * 0.18) * 1.3;
        return (baseReturn / 12) + volatility; // Monthly return
      });

      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Your Portfolio',
              data: portfolioData,
              borderColor: '#D72638',
              backgroundColor: 'rgba(215, 38, 56, 0.1)',
              borderWidth: 3,
              fill: false,
              tension: 0.4,
            },
            {
              label: 'S&P 500',
              data: sp500Data,
              borderColor: '#2563EB',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              borderWidth: 2,
              fill: false,
              tension: 0.4,
            },
            {
              label: 'Dow Jones',
              data: dowData,
              borderColor: '#16A34A',
              backgroundColor: 'rgba(22, 163, 74, 0.1)',
              borderWidth: 2,
              fill: false,
              tension: 0.4,
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
                  return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
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
              beginAtZero: false,
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
                maxTicksLimit: 6,
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
  }, [portfolioReturn, portfolioValue, totalCost]);

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Portfolio Performance vs Market Indices
        </CardTitle>
        <p className="text-sm text-gray-600">
          Compare your portfolio performance against major market indices
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80 relative">
          <canvas ref={canvasRef} />
        </div>
        
        {/* Performance Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Your Portfolio</div>
            <div className={`text-lg font-semibold ${portfolioReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioReturn >= 0 ? '+' : ''}{portfolioReturn.toFixed(2)}%
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">S&P 500 (YTD)</div>
            <div className="text-lg font-semibold text-blue-600">
              +8.5%
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Dow Jones (YTD)</div>
            <div className="text-lg font-semibold text-green-600">
              +7.8%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}