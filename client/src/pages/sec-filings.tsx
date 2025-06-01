import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AddStockModal } from "@/components/add-stock-modal";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Download, Calendar } from "lucide-react";

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
}

export default function SECFilings() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [searchTicker, setSearchTicker] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [selectedFilingTypes, setSelectedFilingTypes] = useState<string[]>([]);

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

  const filteredFilings = filings.filter(filing => 
    selectedFilingTypes.length === 0 || selectedFilingTypes.includes(filing.form)
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFilingUrl = (filing: SECFiling) => {
    const baseUrl = "https://www.sec.gov/Archives/edgar/data";
    // Construct proper SEC EDGAR URL
    return `${baseUrl}/${filing.accessionNumber.replace(/-/g, '')}/${filing.accessionNumber}/${filing.primaryDocument}`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-3 md:p-6 pt-16 md:pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">SEC Filings</h1>
            <p className="text-gray-600">Search and view official SEC filings for public companies</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
              <form onSubmit={handleSearch} className="flex gap-4 mb-4">
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
            ) : filteredFilings.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No filings found</h3>
                <p className="text-gray-500">
                  {selectedFilingTypes.length > 0 
                    ? `No ${selectedFilingTypes.join(", ")} filings found for ${searchTicker}`
                    : `No recent filings found for ${searchTicker}`
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                    {filteredFilings.map((filing) => (
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