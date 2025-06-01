import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Building2, Users, DollarSign, BarChart3 } from "lucide-react";

interface StockDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string;
  companyName: string;
}

export function StockDetailsModal({ isOpen, onClose, ticker, companyName }: StockDetailsModalProps) {
  const [chartPeriod, setChartPeriod] = useState("1y");

  const { data: companyInfo, isLoading: companyLoading } = useQuery({
    queryKey: ["/api/stocks", ticker, "company"],
    enabled: isOpen && !!ticker,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["/api/stocks", ticker, "chart", chartPeriod],
    enabled: isOpen && !!ticker,
  });

  const formatNumber = (value: string | number) => {
    if (!value || value === "None" || value === "N/A") return "N/A";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "N/A";
    
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toLocaleString()}`;
  };

  const formatPercent = (value: string | number) => {
    if (!value || value === "None" || value === "N/A") return "N/A";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "N/A";
    return `${(num * 100).toFixed(2)}%`;
  };

  const formatLargeNumber = (value: string | number) => {
    if (!value || value === "None" || value === "N/A") return "N/A";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "N/A";
    return num.toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {ticker} - {companyName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Company Overview</TabsTrigger>
            <TabsTrigger value="financials">Financial Metrics</TabsTrigger>
            <TabsTrigger value="chart">Stock Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {companyLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-8 w-8 border-b-2 border-brand-blue"></div>
              </div>
            ) : companyInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Sector</div>
                      <div className="font-medium">{companyInfo.sector || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Industry</div>
                      <div className="font-medium">{companyInfo.industry || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Employees</div>
                      <div className="font-medium flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {formatLargeNumber(companyInfo.employees)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Market Cap</div>
                      <div className="font-medium">{formatNumber(companyInfo.marketCap)}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Key Financial Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Revenue (TTM)</div>
                      <div className="font-medium">{formatNumber(companyInfo.revenue)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Gross Profit (TTM)</div>
                      <div className="font-medium">{formatNumber(companyInfo.grossProfit)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Profit Margin</div>
                      <div className="font-medium">{formatPercent(companyInfo.profitMargin)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Operating Margin</div>
                      <div className="font-medium">{formatPercent(companyInfo.operatingMargin)}</div>
                    </div>
                  </CardContent>
                </Card>

                {companyInfo.description && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Company Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {companyInfo.description}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-gray-500">Company information not available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="financials" className="space-y-4">
            {companyLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-8 w-8 border-b-2 border-brand-blue"></div>
              </div>
            ) : companyInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Valuation Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">P/E Ratio (TTM)</span>
                      <span className="font-medium">{companyInfo.trailingPE || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Forward P/E</span>
                      <span className="font-medium">{companyInfo.forwardPE || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price/Sales</span>
                      <span className="font-medium">{companyInfo.priceToSales || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price/Book</span>
                      <span className="font-medium">{companyInfo.priceToBook || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">EV/Revenue</span>
                      <span className="font-medium">{companyInfo.evToRevenue || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">EV/EBITDA</span>
                      <span className="font-medium">{companyInfo.evToEbitda || "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Growth Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quarterly Revenue Growth</span>
                      <span className="font-medium">{formatPercent(companyInfo.quarterlyRevenueGrowth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quarterly Earnings Growth</span>
                      <span className="font-medium">{formatPercent(companyInfo.quarterlyEarningsGrowth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Return on Assets</span>
                      <span className="font-medium">{formatPercent(companyInfo.returnOnAssets)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Return on Equity</span>
                      <span className="font-medium">{formatPercent(companyInfo.returnOnEquity)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Beta</span>
                      <span className="font-medium">{companyInfo.beta || "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Trading Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">52-Week High</span>
                      <span className="font-medium">${companyInfo.week52High || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">52-Week Low</span>
                      <span className="font-medium">${companyInfo.week52Low || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">50-Day MA</span>
                      <span className="font-medium">${companyInfo.movingAverage50 || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">200-Day MA</span>
                      <span className="font-medium">${companyInfo.movingAverage200 || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Shares Outstanding</span>
                      <span className="font-medium">{formatLargeNumber(companyInfo.sharesOutstanding)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Analyst Target</span>
                      <span className="font-medium">${companyInfo.analystTargetPrice || "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>

                {companyInfo.dividendPerShare && parseFloat(companyInfo.dividendPerShare) > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Dividend Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Dividend Per Share</span>
                        <span className="font-medium">${companyInfo.dividendPerShare}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Dividend Yield</span>
                        <span className="font-medium">{formatPercent(companyInfo.dividendYield)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ex-Dividend Date</span>
                        <span className="font-medium">{companyInfo.exDividendDate || "N/A"}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <p className="text-gray-500">Financial metrics not available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="chart" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {["1d", "5d", "1m", "3m", "6m", "1y", "2y", "5y"].map((period) => (
                <Button
                  key={period}
                  variant={chartPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartPeriod(period)}
                >
                  {period}
                </Button>
              ))}
            </div>

            {chartLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin h-8 w-8 border-b-2 border-brand-blue"></div>
              </div>
            ) : chartData && chartData.data ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    {ticker} Stock Chart ({chartPeriod})
                  </CardTitle>
                  <CardDescription>
                    Price data from {chartData.exchangeName} • {chartData.currency}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            });
                          }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`$${value?.toFixed(2)}`, 'Close Price']}
                          labelFormatter={(label) => {
                            const date = new Date(label);
                            return date.toLocaleDateString('en-US', { 
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short', 
                              day: 'numeric' 
                            });
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="close" 
                          stroke="#2563eb" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <p className="text-gray-500">Chart data not available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}