import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Globe } from "lucide-react";

interface TradeData {
  exporter: string;
  importer: string;
  commodity: string;
  value_usd: number;
  year: number;
  exporter_code: string;
  importer_code: string;
}

export default function TradeMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedCommodity, setSelectedCommodity] = useState('Iron Ore');
  const [selectedYear, setSelectedYear] = useState('2023');
  const [tradeData, setTradeData] = useState<TradeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);

  const commodities = [
    { value: 'Iron Ore', label: 'Iron Ore (HS 2601)', hsCode: '2601' },
    { value: 'Gold', label: 'Gold (HS 7108)', hsCode: '7108' },
    { value: 'Microchips', label: 'Microchips (HS 8542)', hsCode: '8542' },
  ];

  const years = ['2023', '2022', '2021', '2020'];

  // Sample trade data for demonstration
  const sampleTradeData: TradeData[] = [
    {
      exporter: "Australia",
      importer: "China",
      commodity: "Iron Ore",
      value_usd: 54000000000,
      year: 2023,
      exporter_code: "AU",
      importer_code: "CN"
    },
    {
      exporter: "Brazil",
      importer: "China",
      commodity: "Iron Ore",
      value_usd: 28000000000,
      year: 2023,
      exporter_code: "BR",
      importer_code: "CN"
    },
    {
      exporter: "Australia",
      importer: "Japan",
      commodity: "Iron Ore",
      value_usd: 8500000000,
      year: 2023,
      exporter_code: "AU",
      importer_code: "JP"
    },
    {
      exporter: "China",
      importer: "United States",
      commodity: "Gold",
      value_usd: 15000000000,
      year: 2023,
      exporter_code: "CN",
      importer_code: "US"
    },
    {
      exporter: "South Africa",
      importer: "India",
      commodity: "Gold",
      value_usd: 12000000000,
      year: 2023,
      exporter_code: "ZA",
      importer_code: "IN"
    },
    {
      exporter: "Taiwan",
      importer: "United States",
      commodity: "Microchips",
      value_usd: 75000000000,
      year: 2023,
      exporter_code: "TW",
      importer_code: "US"
    },
    {
      exporter: "South Korea",
      importer: "China",
      commodity: "Microchips",
      value_usd: 45000000000,
      year: 2023,
      exporter_code: "KR",
      importer_code: "CN"
    }
  ];

  useEffect(() => {
    // Initialize map with sample data
    setTradeData(sampleTradeData);
    loadMap();
  }, []);

  useEffect(() => {
    if (mapInitialized) {
      updateMapData();
    }
  }, [selectedCommodity, selectedYear, mapInitialized]);

  const loadMap = async () => {
    if (!mapRef.current) return;

    setIsLoading(true);
    
    try {
      // Create a simple SVG-based world map for now
      const mapContainer = mapRef.current;
      mapContainer.innerHTML = `
        <div class="relative w-full h-full bg-blue-50 rounded-lg overflow-hidden">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="w-32 h-32 bg-blue-200 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg class="w-16 h-16 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Interactive World Map</h3>
              <p class="text-gray-600 text-sm max-w-md">
                This would display an interactive world map showing trade flows for ${selectedCommodity} in ${selectedYear}.
                For a production version, this would integrate with Mapbox GL JS or Leaflet with real UN Comtrade data.
              </p>
            </div>
          </div>
          
          <!-- Sample Trade Routes Visualization -->
          <div class="absolute bottom-4 left-4 right-4">
            <div class="bg-white rounded-lg p-4 shadow-lg">
              <h4 class="font-semibold text-gray-900 mb-2">Top Trade Routes for ${selectedCommodity}</h4>
              <div class="space-y-2" id="trade-routes">
                <!-- Will be populated by updateMapData -->
              </div>
            </div>
          </div>
        </div>
      `;

      setMapInitialized(true);
    } catch (error) {
      console.error('Error loading map:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMapData = () => {
    const filteredData = tradeData.filter(
      trade => trade.commodity === selectedCommodity && trade.year.toString() === selectedYear
    );

    // Update the trade routes display
    const routesContainer = document.getElementById('trade-routes');
    if (routesContainer) {
      routesContainer.innerHTML = filteredData
        .sort((a, b) => b.value_usd - a.value_usd)
        .slice(0, 5)
        .map(trade => `
          <div class="flex justify-between items-center text-sm">
            <span class="font-medium">${trade.exporter} → ${trade.importer}</span>
            <span class="text-blue-600 font-semibold">$${(trade.value_usd / 1000000000).toFixed(1)}B</span>
          </div>
        `)
        .join('');
    }
  };

  const handleCommodityChange = (value: string) => {
    setSelectedCommodity(value);
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onAddStock={() => {}} />
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Global Trade Intelligence Map
              </h1>
              <p className="text-gray-600">
                Visualize commodity trade flows and analyze global supply chain patterns
              </p>
            </div>

            {/* Controls */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Map Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commodity
                    </label>
                    <Select value={selectedCommodity} onValueChange={handleCommodityChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select commodity" />
                      </SelectTrigger>
                      <SelectContent>
                        {commodities.map((commodity) => (
                          <SelectItem key={commodity.value} value={commodity.value}>
                            {commodity.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <Select value={selectedYear} onValueChange={handleYearChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actions
                    </label>
                    <Button 
                      onClick={updateMapData}
                      className="w-full bg-brand-red hover:bg-brand-red/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 mr-2" />
                          Update Map
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Container */}
            <Card>
              <CardContent className="p-0">
                <div 
                  ref={mapRef}
                  className="w-full h-[600px] relative"
                >
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {tradeData.filter(t => t.commodity === selectedCommodity).length}
                  </div>
                  <div className="text-sm text-gray-600">Trade Routes</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    ${(tradeData
                      .filter(t => t.commodity === selectedCommodity && t.year.toString() === selectedYear)
                      .reduce((sum, t) => sum + t.value_usd, 0) / 1000000000
                    ).toFixed(1)}B
                  </div>
                  <div className="text-sm text-gray-600">Total Trade Value</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {new Set(tradeData
                      .filter(t => t.commodity === selectedCommodity)
                      .map(t => t.exporter)
                    ).size}
                  </div>
                  <div className="text-sm text-gray-600">Exporting Countries</div>
                </CardContent>
              </Card>
            </div>

            {/* Development Note */}
            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Development Notes</h3>
                <p className="text-blue-800 text-sm">
                  This is a prototype showing the structure for a Global Trade Intelligence Map. 
                  For production, this would integrate with Mapbox GL JS or Leaflet for interactive mapping, 
                  and connect to the UN Comtrade API for real-time trade data. 
                  Would you like me to implement the full interactive map with a specific mapping library?
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}