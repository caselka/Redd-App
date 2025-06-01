import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  FileText, 
  Upload, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Target
} from "lucide-react";

interface TenKAnalysisData {
  summary: string;
  financialHighlights: {
    revenue: string;
    netIncome: string;
    totalAssets: string;
    debt: string;
    cashFlow: string;
  };
  businessOverview: string;
  riskFactors: string[];
  competitivePosition: string;
  managementDiscussion: string;
  keyMetrics: {
    profitMargin: string;
    returnOnEquity: string;
    debtToEquity: string;
    currentRatio: string;
  };
  investmentThesis: {
    bullCase: string[];
    bearCase: string[];
    valuation: string;
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  confidenceScore: number;
}

interface TenKAnalysis {
  id: number;
  ticker: string;
  companyName: string;
  filingDate: string;
  analysisData: TenKAnalysisData;
  createdAt: string;
}

export default function SecFilings() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [uploadForm, setUploadForm] = useState({
    ticker: "",
    companyName: "",
    documentText: "",
    filingDate: ""
  });
  const [selectedAnalysis, setSelectedAnalysis] = useState<TenKAnalysis | null>(null);

  // Fetch user's 10-K analyses
  const { data: analyses = [], isLoading } = useQuery<TenKAnalysis[]>({
    queryKey: ["/api/10k/analyses"],
    enabled: isAuthenticated,
  });

  // Upload and analyze 10-K mutation
  const analyzeMutation = useMutation({
    mutationFn: async (data: typeof uploadForm) => {
      return await apiRequest("/api/10k/analyze", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Your 10-K document has been successfully analyzed with AI insights.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/10k/analyses"] });
      setUploadForm({ ticker: "", companyName: "", documentText: "", filingDate: "" });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze 10-K document",
        variant: "destructive",
      });
    },
  });

  // Delete analysis mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/10k/analyses/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      toast({
        title: "Analysis Deleted",
        description: "The 10-K analysis has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/10k/analyses"] });
      setSelectedAnalysis(null);
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the analysis.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.ticker || !uploadForm.companyName || !uploadForm.documentText) {
      toast({
        title: "Missing Information",
        description: "Please fill in ticker, company name, and document text.",
        variant: "destructive",
      });
      return;
    }
    analyzeMutation.mutate(uploadForm);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      default: return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4" />;
      case 'negative': return <TrendingDown className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Please log in to access SEC filing analysis.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          SEC Filing Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload and analyze 10-K filings with AI-powered insights for investment decisions
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload & Analyze
          </TabsTrigger>
          <TabsTrigger value="analyses" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Past Analyses ({analyses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload 10-K Filing
              </CardTitle>
              <CardDescription>
                Upload a 10-K SEC filing document to get comprehensive AI analysis including financial insights, risk assessment, and investment thesis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ticker">Stock Ticker</Label>
                    <Input
                      id="ticker"
                      placeholder="e.g., AAPL"
                      value={uploadForm.ticker}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, ticker: e.target.value.toUpperCase() }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="e.g., Apple Inc."
                      value={uploadForm.companyName}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, companyName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="filingDate">Filing Date (Optional)</Label>
                  <Input
                    id="filingDate"
                    type="date"
                    value={uploadForm.filingDate}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, filingDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="documentText">10-K Document Text</Label>
                  <Textarea
                    id="documentText"
                    placeholder="Paste the complete 10-K filing text here..."
                    value={uploadForm.documentText}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, documentText: e.target.value }))}
                    className="min-h-[200px]"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste the complete text from the 10-K filing. The AI will analyze all sections including financials, business overview, and risk factors.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={analyzeMutation.isPending}
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyses">
          <div className="grid gap-4">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  <p>Loading analyses...</p>
                </CardContent>
              </Card>
            ) : analyses.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">No 10-K analyses yet. Upload your first filing to get started.</p>
                </CardContent>
              </Card>
            ) : (
              analyses.map((analysis) => (
                <Card key={analysis.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {analysis.ticker}
                          <Badge variant="secondary">{analysis.companyName}</Badge>
                        </CardTitle>
                        <CardDescription>
                          Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
                          {analysis.filingDate && ` • Filed ${new Date(analysis.filingDate).toLocaleDateString()}`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 ${getSentimentColor(analysis.analysisData.sentiment)}`}>
                          {getSentimentIcon(analysis.analysisData.sentiment)}
                          <span className="text-sm font-medium capitalize">
                            {analysis.analysisData.sentiment}
                          </span>
                        </div>
                        <Badge variant="outline">
                          {Math.round(analysis.analysisData.confidenceScore * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {analysis.analysisData.summary}
                    </p>
                    <div className="flex justify-between items-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedAnalysis(analysis)}
                          >
                            View Full Analysis
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>{analysis.ticker} - {analysis.companyName}</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="h-full">
                            {selectedAnalysis && (
                              <AnalysisDetails analysis={selectedAnalysis.analysisData} />
                            )}
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(analysis.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnalysisDetails({ analysis }: { analysis: TenKAnalysisData }) {
  return (
    <div className="space-y-6 p-4">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{analysis.summary}</p>
        </CardContent>
      </Card>

      {/* Financial Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Revenue</Label>
              <p className="text-sm">{analysis.financialHighlights.revenue}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Net Income</Label>
              <p className="text-sm">{analysis.financialHighlights.netIncome}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Total Assets</Label>
              <p className="text-sm">{analysis.financialHighlights.totalAssets}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Debt</Label>
              <p className="text-sm">{analysis.financialHighlights.debt}</p>
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium">Cash Flow</Label>
              <p className="text-sm">{analysis.financialHighlights.cashFlow}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Key Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Profit Margin</Label>
              <p className="text-sm">{analysis.keyMetrics.profitMargin}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Return on Equity</Label>
              <p className="text-sm">{analysis.keyMetrics.returnOnEquity}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Debt to Equity</Label>
              <p className="text-sm">{analysis.keyMetrics.debtToEquity}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Current Ratio</Label>
              <p className="text-sm">{analysis.keyMetrics.currentRatio}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Business Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{analysis.businessOverview}</p>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.riskFactors.map((risk, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-sm">{risk}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Investment Thesis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Investment Thesis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-green-600 dark:text-green-400">Bull Case</Label>
            <ul className="mt-2 space-y-1">
              {analysis.investmentThesis.bullCase.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <Label className="text-sm font-medium text-red-600 dark:text-red-400">Bear Case</Label>
            <ul className="mt-2 space-y-1">
              {analysis.investmentThesis.bearCase.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <Label className="text-sm font-medium">Valuation Assessment</Label>
            <p className="text-sm mt-1">{analysis.investmentThesis.valuation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Competitive Position */}
      <Card>
        <CardHeader>
          <CardTitle>Competitive Position</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{analysis.competitivePosition}</p>
        </CardContent>
      </Card>

      {/* Management Discussion */}
      <Card>
        <CardHeader>
          <CardTitle>Management Discussion & Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{analysis.managementDiscussion}</p>
        </CardContent>
      </Card>
    </div>
  );
}