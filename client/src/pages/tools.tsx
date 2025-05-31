import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AddStockModal } from "@/components/add-stock-modal";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Calculator, DollarSign, TrendingUp, Bell, Brain, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Tools() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Compound Interest Calculator State
  const [principal, setPrincipal] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");
  const [compoundResult, setCompoundResult] = useState<any>(null);

  // EPV Calculator State
  const [normalizedIncome, setNormalizedIncome] = useState("");
  const [costOfCapital, setCostOfCapital] = useState("9");
  const [adjustForCyclicality, setAdjustForCyclicality] = useState(false);
  const [cyclicalYears, setCyclicalYears] = useState("5");
  const [epvResult, setEpvResult] = useState<any>(null);

  // Price Alert State
  const [alertTicker, setAlertTicker] = useState("");
  const [targetPrice, setTargetPrice] = useState("");

  // AI Gut Check State
  const [stockIdea, setStockIdea] = useState("");
  const [reasonForBuy, setReasonForBuy] = useState("");
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const calculateCompoundInterest = () => {
    const p = parseFloat(principal);
    const pmt = parseFloat(monthlyContribution);
    const r = parseFloat(annualRate) / 100 / 12; // Monthly rate
    const n = parseFloat(years) * 12; // Total months

    if (isNaN(p) || isNaN(pmt) || isNaN(r) || isNaN(n)) {
      toast({
        title: "Error",
        description: "Please enter valid numbers for all fields",
        variant: "destructive",
      });
      return;
    }

    // Future value of lump sum
    const fvLump = p * Math.pow(1 + r, n);
    
    // Future value of annuity (monthly contributions)
    const fvAnnuity = pmt * ((Math.pow(1 + r, n) - 1) / r);
    
    const totalValue = fvLump + fvAnnuity;
    const totalContributed = p + (pmt * n);
    const totalGain = totalValue - totalContributed;

    setCompoundResult({
      totalValue,
      totalContributed,
      totalGain,
      gainPercent: (totalGain / totalContributed) * 100,
    });
  };

  const calculateEPV = () => {
    let income = parseFloat(normalizedIncome);
    const costCap = parseFloat(costOfCapital) / 100;

    if (isNaN(income) || isNaN(costCap)) {
      toast({
        title: "Error",
        description: "Please enter valid numbers",
        variant: "destructive",
      });
      return;
    }

    // Adjust for cyclicality if enabled
    if (adjustForCyclicality) {
      const cycYears = parseFloat(cyclicalYears);
      if (!isNaN(cycYears)) {
        income = income * (cycYears / 10); // Simple cyclical adjustment
      }
    }

    const epv = income / costCap;
    
    setEpvResult({
      epv,
      normalizedIncome: income,
      costOfCapital: costCap * 100,
      cyclicallyAdjusted: adjustForCyclicality,
    });
  };

  const createPriceAlert = async () => {
    if (!alertTicker || !targetPrice) {
      toast({
        title: "Error",
        description: "Please enter both ticker and target price",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("/api/price-alerts", {
        method: "POST",
        body: JSON.stringify({
          ticker: alertTicker.toUpperCase(),
          targetPrice: parseFloat(targetPrice),
        }),
        headers: { "Content-Type": "application/json" },
      });

      toast({
        title: "Success",
        description: `Price alert created for ${alertTicker.toUpperCase()} at $${targetPrice}`,
      });

      setAlertTicker("");
      setTargetPrice("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create price alert",
        variant: "destructive",
      });
    }
  };

  const generateAIQuestions = async () => {
    if (!stockIdea.trim()) {
      toast({
        title: "Error",
        description: "Please describe your stock idea first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingQuestions(true);
    
    try {
      const response = await apiRequest("/api/ai-gut-check", {
        method: "POST",
        body: JSON.stringify({
          stockIdea,
          reasonForBuy,
        }),
        headers: { "Content-Type": "application/json" },
      });

      setAiQuestions(response.questions || []);
    } catch (error) {
      // Fallback questions if API fails
      const fallbackQuestions = [
        "What's the biggest risk you're ignoring about this investment?",
        "If this stock drops 50% tomorrow, what would be your plan?",
        "Would you be happy to own this company with no price quotes for 5 years?",
      ];
      setAiQuestions(fallbackQuestions);
      
      toast({
        title: "Notice",
        description: "Using standard gut-check questions. AI analysis requires additional setup.",
        variant: "default",
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <Header onAddStock={() => setIsAddStockModalOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-md mx-auto mt-20 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
              <p className="text-gray-600 mb-6">Please log in to access investment tools</p>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-brand-blue hover:bg-red-700"
              >
                Login with Replit
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-hidden">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Investment Tools</h1>
            <p className="text-gray-600">Professional tools for investment analysis and planning</p>
          </div>

          <Tabs defaultValue="compound" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="compound">Compound Interest</TabsTrigger>
              <TabsTrigger value="epv">EPV Estimator</TabsTrigger>
              <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
              <TabsTrigger value="ai-check">AI Gut Check</TabsTrigger>
            </TabsList>

            {/* Compound Interest Calculator */}
            <TabsContent value="compound">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Compound Interest Calculator
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Calculate the power of compound growth with regular contributions
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="principal">Initial Investment ($)</Label>
                        <Input
                          id="principal"
                          type="number"
                          placeholder="10000"
                          value={principal}
                          onChange={(e) => setPrincipal(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="monthly">Monthly Contribution ($)</Label>
                        <Input
                          id="monthly"
                          type="number"
                          placeholder="500"
                          value={monthlyContribution}
                          onChange={(e) => setMonthlyContribution(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                        <Input
                          id="rate"
                          type="number"
                          step="0.1"
                          placeholder="7.0"
                          value={annualRate}
                          onChange={(e) => setAnnualRate(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="years">Time Period (years)</Label>
                        <Input
                          id="years"
                          type="number"
                          placeholder="30"
                          value={years}
                          onChange={(e) => setYears(e.target.value)}
                        />
                      </div>

                      <Button onClick={calculateCompoundInterest} className="w-full bg-brand-blue hover:bg-red-700">
                        Calculate
                      </Button>
                    </div>

                    {compoundResult && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Results</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                            <span>Final Value:</span>
                            <span className="font-bold text-green-600">
                              ${compoundResult.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                            <span>Total Contributed:</span>
                            <span className="font-bold text-blue-600">
                              ${compoundResult.totalContributed.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                            <span>Total Gain:</span>
                            <span className="font-bold text-purple-600">
                              ${compoundResult.totalGain.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                          <div className="flex justify-between p-3 bg-orange-50 rounded-lg">
                            <span>Return:</span>
                            <span className="font-bold text-orange-600">
                              {compoundResult.gainPercent.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* EPV Estimator */}
            <TabsContent value="epv">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Earnings Power Value (EPV) Estimator
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Quick Buffett-style intrinsic valuation based on normalized earnings
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="income">Normalized Net Income ($M)</Label>
                        <Input
                          id="income"
                          type="number"
                          placeholder="1000"
                          value={normalizedIncome}
                          onChange={(e) => setNormalizedIncome(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cost">Cost of Capital (%)</Label>
                        <Select value={costOfCapital} onValueChange={setCostOfCapital}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="8">8% (Conservative)</SelectItem>
                            <SelectItem value="9">9% (Moderate)</SelectItem>
                            <SelectItem value="10">10% (Aggressive)</SelectItem>
                            <SelectItem value="12">12% (High Risk)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="cyclical"
                          checked={adjustForCyclicality}
                          onCheckedChange={setAdjustForCyclicality}
                        />
                        <Label htmlFor="cyclical">Adjust for cyclicality</Label>
                      </div>

                      {adjustForCyclicality && (
                        <div>
                          <Label htmlFor="cycYears">Average period (years)</Label>
                          <Input
                            id="cycYears"
                            type="number"
                            value={cyclicalYears}
                            onChange={(e) => setCyclicalYears(e.target.value)}
                          />
                        </div>
                      )}

                      <Button onClick={calculateEPV} className="w-full bg-brand-blue hover:bg-red-700">
                        Calculate EPV
                      </Button>
                    </div>

                    {epvResult && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">EPV Results</h3>
                        <div className="space-y-3">
                          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                            <div className="text-sm text-green-600">Earnings Power Value</div>
                            <div className="text-2xl font-bold text-green-700">
                              ${epvResult.epv.toLocaleString('en-US', { maximumFractionDigits: 0 })}M
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Normalized Income: ${epvResult.normalizedIncome.toLocaleString()}M</div>
                            <div>Cost of Capital: {epvResult.costOfCapital}%</div>
                            {epvResult.cyclicallyAdjusted && (
                              <Badge variant="outline" className="mt-2">Cyclically Adjusted</Badge>
                            )}
                          </div>
                          <div className="p-3 bg-blue-50 rounded text-sm text-blue-800">
                            <strong>Note:</strong> EPV assumes no growth. Consider adding a growth premium for growing companies.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Price Alerts */}
            <TabsContent value="alerts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Price Alert Creator
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Get notified when stocks hit your target prices
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="alertTicker">Stock Symbol</Label>
                      <Input
                        id="alertTicker"
                        placeholder="AAPL"
                        value={alertTicker}
                        onChange={(e) => setAlertTicker(e.target.value.toUpperCase())}
                        className="uppercase"
                      />
                    </div>

                    <div>
                      <Label htmlFor="targetPrice">Target Price ($)</Label>
                      <Input
                        id="targetPrice"
                        type="number"
                        step="0.01"
                        placeholder="150.00"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                      />
                    </div>

                    <div className="flex items-end">
                      <Button onClick={createPriceAlert} className="w-full bg-brand-blue hover:bg-red-700">
                        Create Alert
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-800">
                        Alerts will be sent via Telegram bot when configured. Email notifications coming soon.
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Gut Check */}
            <TabsContent value="ai-check">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI "Gut Check" Assistant
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Get challenging questions about your investment ideas to prevent emotional decisions
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="stockIdea">Stock/Investment Idea</Label>
                      <Input
                        id="stockIdea"
                        placeholder="e.g., AAPL, Tesla, Real Estate"
                        value={stockIdea}
                        onChange={(e) => setStockIdea(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="reason">Why do you want to buy this? (Optional)</Label>
                      <Textarea
                        id="reason"
                        placeholder="Describe your investment thesis, what attracted you to this opportunity..."
                        value={reasonForBuy}
                        onChange={(e) => setReasonForBuy(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={generateAIQuestions} 
                      disabled={isGeneratingQuestions}
                      className="w-full bg-brand-blue hover:bg-red-700"
                    >
                      {isGeneratingQuestions ? "Generating Questions..." : "Get Gut Check Questions"}
                    </Button>
                  </div>

                  {aiQuestions.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Think About These Questions:</h3>
                      <div className="space-y-3">
                        {aiQuestions.map((question, index) => (
                          <div key={index} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                            <div className="flex items-start">
                              <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                                {index + 1}
                              </span>
                              <p className="text-red-800 font-medium">{question}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Take your time</strong> - Write down honest answers to these questions before making any investment decisions.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <AddStockModal 
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
      />
    </div>
  );
}