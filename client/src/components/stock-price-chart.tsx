import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReddSpinner } from "@/components/ui/redd-spinner";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockPriceChartProps {
  ticker: string;
}

export function StockPriceChart({ ticker }: StockPriceChartProps) {
  const [period, setPeriod] = useState("1y");

  const { data: chartData, isLoading } = useQuery({
    queryKey: [`/api/stocks/${ticker}/chart`, period],
    queryFn: async () => {
      const response = await fetch(`/api/stocks/${ticker}/chart?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      return response.json();
    },
  });

  const periods = [
    { value: "1d", label: "1 Day" },
    { value: "5d", label: "5 Days" },
    { value: "1m", label: "1 Month" },
    { value: "3m", label: "3 Months" },
    { value: "6m", label: "6 Months" },
    { value: "1y", label: "1 Year" },
    { value: "2y", label: "2 Years" },
    { value: "5y", label: "5 Years" },
  ];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <ReddSpinner size="lg" className="mx-auto mb-2" />
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (!chartData?.data || chartData.data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No chart data available</p>
        </div>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${ticker} - Stock Price`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `Price: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price ($)',
        },
        ticks: {
          callback: function(value: any) {
            return `$${value.toFixed(2)}`;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const chartDataConfig = {
    labels: chartData.data.map((item: any) => {
      const date = new Date(item.date);
      return date.toLocaleDateString();
    }),
    datasets: [
      {
        label: 'Price',
        data: chartData.data.map((item: any) => item.close),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{ticker} Stock Price</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 min-h-0">
        <Line data={chartDataConfig} options={chartOptions} />
      </div>
    </div>
  );
}