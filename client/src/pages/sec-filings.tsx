import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AddStockModal } from "@/components/add-stock-modal";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ExternalLink, Download, Calendar, Filter, ArrowUpDown } from "lucide-react";

interface SECFiling {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  acceptanceDateTime: string;
  act: string;
  form: string;
  fileNumber: string;
  filmNumber: string;
  items: string;
  size: number;
  isXBRL: boolean;
  isInlineXBRL: boolean;
  primaryDocument: string;
  primaryDocDescription: string;
  cik: string;
}

export default function SECFilings() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [searchTicker, setSearchTicker] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [selectedFilingTypes, setSelectedFilingTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [formTypeFilter, setFormTypeFilter] = useState<string>("all");

  const { data: filings = [], isLoading, error } = useQuery<SECFiling[]>({
    queryKey: [`/api/sec-filings/${searchTicker}`],
    enabled: searchSubmitted && searchTicker.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTicker.trim()) {
      setSearchSubmitted(true);
    }
  };

  const filingTypes = [
    { type: "10-K", description: "Annual Report" },
    { type: "10-Q", description: "Quarterly Report" },
    { type: "8-K", description: "Current Report" },
    { type: "DEF 14A", description: "Proxy Statement" },
    { type: "13F", description: "Institutional Holdings" },
    { type: "SC 13G", description: "Beneficial Ownership" },
  ];

  // Apply filters and sorting
  const filteredAndSortedFilings = filings
    .filter(filing => {
      // Form type filter
      if (formTypeFilter !== "all" && filing.form !== formTypeFilter) return false;
      
      // Date filter
      if (dateFilter !== "all") {
        const filingDate = new Date(filing.filingDate);
        const now = new Date();
        const monthsAgo = new Date();
        
        switch (dateFilter) {
          case "1month":
            monthsAgo.setMonth(now.getMonth() - 1);
            if (filingDate < monthsAgo) return false;
            break;
          case "3months":
            monthsAgo.setMonth(now.getMonth() - 3);
            if (filingDate < monthsAgo) return false;
            break;
          case "1year":
            monthsAgo.setFullYear(now.getFullYear() - 1);
            if (filingDate < monthsAgo) return false;
            break;
        }
      }
      
      // Legacy selected filing types filter
      if (selectedFilingTypes.length > 0 && !selectedFilingTypes.includes(filing.form)) return false;
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime();
        case "date-asc":
          return new Date(a.filingDate).getTime() - new Date(b.filingDate).getTime();
        case "form-asc":
          return a.form.localeCompare(b.form);
        case "form-desc":
          return b.form.localeCompare(a.form);
        case "size-desc":
          return b.size - a.size;
        case "size-asc":
          return a.size - b.size;
        default:
          return 0;
      }
    });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFilingUrl = (filing: SECFiling) => {
    // Construct proper SEC EDGAR document URL using CIK and accession number
    if (filing.cik && filing.primaryDocument) {
      const accessionNoHyphens = filing.accessionNumber.replace(/-/g, '');
      return `https://www.sec.gov/Archives/edgar/data/${filing.cik}/${accessionNoHyphens}/${filing.primaryDocument}`;
    }
    // Fallback to SEC search page if CIK or document info is missing
    return `https://www.sec.gov/edgar/search/#/q=${searchTicker}&dateRange=all&forms=${filing.form}`;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-2 md:p-6 pt-16 md:pt-6 mobile-main max-w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">SEC Filings</h1>
            <p className="text-gray-600">Search and view official SEC filings for public companies</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
              <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Enter stock symbol (e.g., AAPL, MSFT)"
                    value={searchTicker}
                    onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" className="bg-brand-blue hover:bg-red-700">
                  Search Filings
                </Button>
              </form>

              {/* Filtering and Sorting Controls */}
              {searchSubmitted && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Filter className="inline h-4 w-4 mr-1" />
                      Form Type
                    </label>
                    <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All forms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Forms</SelectItem>
                        <SelectItem value="10-K">10-K (Annual Report)</SelectItem>
                        <SelectItem value="10-Q">10-Q (Quarterly Report)</SelectItem>
                        <SelectItem value="8-K">8-K (Current Report)</SelectItem>
                        <SelectItem value="DEF 14A">DEF 14A (Proxy Statement)</SelectItem>
                        <SelectItem value="13F">13F (Institutional Holdings)</SelectItem>
                        <SelectItem value="SC 13G">SC 13G (Beneficial Ownership)</SelectItem>
                        <SelectItem value="4">Form 4 (Insider Trading)</SelectItem>
                        <SelectItem value="3">Form 3 (Initial Ownership)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Date Range
                    </label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All dates" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="1month">Last Month</SelectItem>
                        <SelectItem value="3months">Last 3 Months</SelectItem>
                        <SelectItem value="1year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ArrowUpDown className="inline h-4 w-4 mr-1" />
                      Sort By
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                        <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                        <SelectItem value="form-asc">Form Type (A-Z)</SelectItem>
                        <SelectItem value="form-desc">Form Type (Z-A)</SelectItem>
                        <SelectItem value="size-desc">File Size (Largest)</SelectItem>
                        <SelectItem value="size-asc">File Size (Smallest)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFormTypeFilter("all");
                        setDateFilter("all");
                        setSortBy("date-desc");
                        setSelectedFilingTypes([]);
                      }}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Filter by type:</span>
                {filingTypes.map((type) => (
                  <Button
                    key={type.type}
                    variant={selectedFilingTypes.includes(type.type) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedFilingTypes(prev => 
                        prev.includes(type.type)
                          ? prev.filter(t => t !== type.type)
                          : [...prev, type.type]
                      );
                    }}
                    className={selectedFilingTypes.includes(type.type) ? "bg-brand-blue" : ""}
                  >
                    {type.type}
                  </Button>
                ))}
                {selectedFilingTypes.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFilingTypes([])}
                    className="text-gray-500"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {error && (
              <div className="p-6 border-b border-gray-200">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">Failed to fetch SEC filings. Please check the ticker symbol and try again.</p>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-brand-blue mx-auto"></div>
                <p className="mt-2 text-gray-500">Searching SEC filings...</p>
              </div>
            ) : !searchSubmitted ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Search SEC Filings</h3>
                <p className="text-gray-500">Enter a stock symbol to view official SEC filings</p>
              </div>
            ) : filteredAndSortedFilings.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No filings found</h3>
                <p className="text-gray-500">
                  {selectedFilingTypes.length > 0 || formTypeFilter !== "all" || dateFilter !== "all"
                    ? `No filings match your current filters for ${searchTicker}`
                    : `No recent filings found for ${searchTicker}`
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="mb-4 text-sm text-gray-600">
                  Showing {filteredAndSortedFilings.length} filing{filteredAndSortedFilings.length !== 1 ? 's' : ''} for {searchTicker}
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filing Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedFilings.map((filing) => (
                      <tr key={filing.accessionNumber} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="font-mono text-xs">
                            {filing.form}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{filing.primaryDocDescription}</div>
                          <div className="text-sm text-gray-500">Accession: {filing.accessionNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {new Date(filing.filingDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {filing.reportDate ? new Date(filing.reportDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatFileSize(filing.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(getFilingUrl(filing), '_blank')}
                              className="text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <AddStockModal 
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
      />
    </div>
  );
}