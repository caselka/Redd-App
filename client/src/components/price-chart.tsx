import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PriceChartProps {
  selectedStock: string;
}

export function PriceChart({ selectedStock }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  const { data: priceHistory = [] } = useQuery({
    queryKey: ["/api/stocks", selectedStock, "prices"],
    enabled: !!selectedStock,
  });

  const { data: stocks = [] } = useQuery({
    queryKey: ["/api/stocks"],
  });

  const selectedStockData = stocks.find((s: any) => s.ticker === selectedStock);

  useEffect(() => {
    const loadChart = async () => {
      if (!canvasRef.current || !selectedStockData || priceHistory.length === 0) return;

      // Dynamically import Chart.js
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Prepare data
      const labels = priceHistory.map((p: any) => 
        new Date(p.timestamp).toLocaleDateString()
      ).reverse();
      
      const prices = priceHistory.map((p: any) => parseFloat(p.price)).reverse();
      const intrinsicValue = parseFloat(selectedStockData.intrinsicValue);

      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Current Price',
              data: prices,
              borderColor: 'hsl(207, 90%, 54%)',
              backgroundColor: 'hsl(207, 90%, 54%)',
              tension: 0.1,
              fill: false,
            },
            {
              label: 'Intrinsic Value',
              data: Array(labels.length).fill(intrinsicValue),
              borderColor: 'hsl(142, 71%, 45%)',
              backgroundColor: 'hsl(142, 71%, 45%)',
              tension: 0.1,
              fill: false,
              borderDash: [5, 5],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: '#F3F4F6',
              },
            },
            x: {
              grid: {
                color: '#F3F4F6',
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
  }, [selectedStock, selectedStockData, priceHistory]);

  if (!selectedStock) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Price vs Intrinsic Value</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-2xl mb-2">📈</div>
            <div>Select a stock to view price chart</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Price vs Intrinsic Value</h3>
        <div className="flex items-center space-x-2">
          <Select value={selectedStock} onValueChange={() => {}}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select stock" />
            </SelectTrigger>
            <SelectContent>
              {stocks.map((stock: any) => (
                <SelectItem key={stock.ticker} value={stock.ticker}>
                  {stock.ticker}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="h-80">
        {priceHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div>No price history available</div>
              <div className="text-sm">Price data will appear once fetched</div>
            </div>
          </div>
        ) : (
          <canvas ref={canvasRef} className="w-full h-full" />
        )}
      </div>
    </div>
  );
}
