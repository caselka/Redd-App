import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Globe } from "lucide-react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface TradeData {
  exporter: string;
  importer: string;
  commodity: string;
  value_usd: number;
  year: number;
  exporter_code: string;
  importer_code: string;
  exporter_lat?: number;
  exporter_lng?: number;
  importer_lat?: number;
  importer_lng?: number;
}

export default function TradeMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
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

  // Bloomberg terminal-style regional trading blocks
  const createRegionalTradingBlocks = () => {
    const regions = [
      { name: 'NORTH AMERICA', countries: ['US', 'CA', 'MX'], color: 'bg-blue-500', intensity: 85 },
      { name: 'EUROPE', countries: ['DE', 'GB', 'FR', 'IT'], color: 'bg-green-500', intensity: 72 },
      { name: 'ASIA PACIFIC', countries: ['CN', 'JP', 'KR', 'IN'], color: 'bg-red-500', intensity: 93 },
      { name: 'MIDDLE EAST', countries: ['SA', 'AE', 'QA'], color: 'bg-yellow-500', intensity: 67 },
      { name: 'AFRICA', countries: ['ZA', 'NG', 'EG'], color: 'bg-purple-500', intensity: 45 },
      { name: 'SOUTH AMERICA', countries: ['BR', 'AR', 'CL'], color: 'bg-orange-500', intensity: 58 }
    ];

    return regions.map((region, index) => {
      const gridPosition = index < 3 ? 'col-span-4' : 'col-span-4';
      const commodityFlow = tradeData
        .filter(trade => trade.commodity === selectedCommodity && trade.year.toString() === selectedYear)
        .filter(trade => region.countries.includes(trade.exporter_code) || region.countries.includes(trade.importer_code))
        .reduce((sum, trade) => sum + trade.value_usd, 0);

      return `
        <div class="${gridPosition} ${region.color} bg-opacity-20 border border-current rounded p-2 hover:bg-opacity-30 transition-all cursor-pointer">
          <div class="text-xs text-green-400 font-mono">${region.name}</div>
          <div class="text-xs text-yellow-400 mt-1">$${(commodityFlow / 1000000000).toFixed(1)}B</div>
          <div class="text-xs text-gray-300 mt-1">${region.intensity}% ACTIVITY</div>
          <div class="w-full bg-gray-700 rounded h-1 mt-2">
            <div class="h-1 rounded transition-all duration-1000 ${region.color}" style="width: ${region.intensity}%"></div>
          </div>
        </div>
      `;
    }).join('');
  };

  // Country coordinates for trade route visualization
  const countryCoordinates: { [key: string]: [number, number] } = {
    'AU': [133.7751, -25.2744], // Australia
    'CN': [104.1954, 35.8617], // China
    'BR': [-51.9253, -14.2350], // Brazil
    'JP': [138.2529, 36.2048], // Japan
    'US': [-95.7129, 37.0902], // United States
    'ZA': [22.9375, -30.5595], // South Africa
    'IN': [78.9629, 20.5937], // India
    'TW': [120.9605, 23.6978], // Taiwan
    'KR': [127.7669, 35.9078], // South Korea
  };

  // Enhanced trade data with coordinates
  const sampleTradeData: TradeData[] = [
    {
      exporter: "Australia",
      importer: "China",
      commodity: "Iron Ore",
      value_usd: 54000000000,
      year: 2023,
      exporter_code: "AU",
      importer_code: "CN",
      exporter_lng: countryCoordinates['AU'][0],
      exporter_lat: countryCoordinates['AU'][1],
      importer_lng: countryCoordinates['CN'][0],
      importer_lat: countryCoordinates['CN'][1]
    },
    {
      exporter: "Brazil",
      importer: "China",
      commodity: "Iron Ore",
      value_usd: 28000000000,
      year: 2023,
      exporter_code: "BR",
      importer_code: "CN",
      exporter_lng: countryCoordinates['BR'][0],
      exporter_lat: countryCoordinates['BR'][1],
      importer_lng: countryCoordinates['CN'][0],
      importer_lat: countryCoordinates['CN'][1]
    },
    {
      exporter: "Australia",
      importer: "Japan",
      commodity: "Iron Ore",
      value_usd: 8500000000,
      year: 2023,
      exporter_code: "AU",
      importer_code: "JP",
      exporter_lng: countryCoordinates['AU'][0],
      exporter_lat: countryCoordinates['AU'][1],
      importer_lng: countryCoordinates['JP'][0],
      importer_lat: countryCoordinates['JP'][1]
    },
    {
      exporter: "China",
      importer: "United States",
      commodity: "Gold",
      value_usd: 15000000000,
      year: 2023,
      exporter_code: "CN",
      importer_code: "US",
      exporter_lng: countryCoordinates['CN'][0],
      exporter_lat: countryCoordinates['CN'][1],
      importer_lng: countryCoordinates['US'][0],
      importer_lat: countryCoordinates['US'][1]
    },
    {
      exporter: "South Africa",
      importer: "India",
      commodity: "Gold",
      value_usd: 12000000000,
      year: 2023,
      exporter_code: "ZA",
      importer_code: "IN",
      exporter_lng: countryCoordinates['ZA'][0],
      exporter_lat: countryCoordinates['ZA'][1],
      importer_lng: countryCoordinates['IN'][0],
      importer_lat: countryCoordinates['IN'][1]
    },
    {
      exporter: "Taiwan",
      importer: "United States",
      commodity: "Microchips",
      value_usd: 75000000000,
      year: 2023,
      exporter_code: "TW",
      importer_code: "US",
      exporter_lng: countryCoordinates['TW'][0],
      exporter_lat: countryCoordinates['TW'][1],
      importer_lng: countryCoordinates['US'][0],
      importer_lat: countryCoordinates['US'][1]
    },
    {
      exporter: "South Korea",
      importer: "China",
      commodity: "Microchips",
      value_usd: 45000000000,
      year: 2023,
      exporter_code: "KR",
      importer_code: "CN",
      exporter_lng: countryCoordinates['KR'][0],
      exporter_lat: countryCoordinates['KR'][1],
      importer_lng: countryCoordinates['CN'][0],
      importer_lat: countryCoordinates['CN'][1]
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
      // Initialize Mapbox with proper token access
      const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      
      if (!mapboxToken) {
        console.log('Mapbox token not configured, using fallback visualization');
        throw new Error('Mapbox access token not configured');
      }
      
      mapboxgl.accessToken = mapboxToken;

      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [0, 20],
        zoom: 2.3,
        projection: 'globe' as any,
        attributionControl: false
      });

      mapInstanceRef.current = map;

      map.on('load', () => {
        // Add atmosphere effect
        map.setFog({
          color: 'rgb(186, 210, 235)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6
        });

        setMapInitialized(true);
        updateMapData();
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
    } catch (error) {
      console.error('Error loading map:', error);
      // Bloomberg terminal-style trade visualization
      const mapContainer = mapRef.current;
      mapContainer.innerHTML = `
        <div class="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden" style="font-family: 'Courier New', monospace;">
          <!-- Bloomberg-style header -->
          <div class="absolute top-0 left-0 right-0 bg-black text-green-400 p-3 text-xs">
            <div class="flex justify-between items-center">
              <span>REDD TRADE INTELLIGENCE MAP - ${selectedCommodity.toUpperCase()} ${selectedYear}</span>
              <span class="text-yellow-400 animate-pulse">LIVE</span>
            </div>
          </div>
          
          <!-- World regions grid -->
          <div class="absolute inset-0 pt-12 grid grid-cols-12 grid-rows-8 gap-1 p-4" id="regional-blocks">
          </div>
          
          <!-- Real-time trade flows panel -->
          <div class="absolute bottom-4 left-4 right-4">
            <div class="bg-black bg-opacity-90 border border-green-400 rounded p-4">
              <div class="text-green-400 text-xs mb-2 font-mono">TRADE FLOWS - ${selectedCommodity.toUpperCase()}</div>
              <div class="space-y-1" id="trade-routes">
                <!-- Will show real trade data -->
              </div>
            </div>
          </div>
        </div>
      `;
      setMapInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMapData = () => {
    const filteredData = tradeData.filter(
      trade => trade.commodity === selectedCommodity && trade.year.toString() === selectedYear
    );

    // If Mapbox is initialized, add trade route visualizations
    if (mapInstanceRef.current && filteredData.length > 0) {
      // Remove existing layers
      try {
        if (mapInstanceRef.current.getLayer('trade-routes')) {
          mapInstanceRef.current.removeLayer('trade-routes');
        }
        if (mapInstanceRef.current.getSource('trade-routes')) {
          mapInstanceRef.current.removeSource('trade-routes');
        }
      } catch (e) {
        // Layers don't exist yet
      }

      // Create GeoJSON for trade routes
      const routeLines = filteredData.map(trade => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [trade.exporter_lng!, trade.exporter_lat!],
            [trade.importer_lng!, trade.importer_lat!]
          ]
        },
        properties: {
          value: trade.value_usd,
          exporter: trade.exporter,
          importer: trade.importer,
          commodity: trade.commodity
        }
      }));

      // Add trade routes source
      mapInstanceRef.current.addSource('trade-routes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: routeLines
        }
      });

      // Add trade routes layer
      mapInstanceRef.current.addLayer({
        id: 'trade-routes',
        type: 'line',
        source: 'trade-routes',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#D72638',
          'line-width': [
            'interpolate',
            ['linear'],
            ['get', 'value'],
            1000000000, 2,
            50000000000, 8,
            100000000000, 12
          ],
          'line-opacity': 0.8
        }
      });

      // Add country markers
      const countryMarkers = filteredData.flatMap(trade => [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [trade.exporter_lng!, trade.exporter_lat!]
          },
          properties: {
            country: trade.exporter,
            type: 'exporter',
            value: trade.value_usd
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [trade.importer_lng!, trade.importer_lat!]
          },
          properties: {
            country: trade.importer,
            type: 'importer',
            value: trade.value_usd
          }
        }
      ]);

      // Remove existing markers
      try {
        if (mapInstanceRef.current.getLayer('country-markers')) {
          mapInstanceRef.current.removeLayer('country-markers');
        }
        if (mapInstanceRef.current.getSource('country-markers')) {
          mapInstanceRef.current.removeSource('country-markers');
        }
      } catch (e) {
        // Layers don't exist yet
      }

      mapInstanceRef.current.addSource('country-markers', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: countryMarkers
        }
      });

      mapInstanceRef.current.addLayer({
        id: 'country-markers',
        type: 'circle',
        source: 'country-markers',
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'type'], 'exporter'],
            8,
            6
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'type'], 'exporter'],
            '#22C55E',
            '#3B82F6'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Add click handlers for popups
      mapInstanceRef.current.on('click', 'country-markers', (e) => {
        const coordinates = e.features![0].geometry.coordinates.slice();
        const properties = e.features![0].properties;

        new mapboxgl.Popup()
          .setLngLat(coordinates as [number, number])
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${properties!.country}</h3>
              <p class="text-sm text-gray-600">${properties!.type === 'exporter' ? 'Exporter' : 'Importer'}</p>
              <p class="text-sm font-medium">$${(properties!.value / 1000000000).toFixed(1)}B</p>
            </div>
          `)
          .addTo(mapInstanceRef.current!);
      });

      mapInstanceRef.current.on('mouseenter', 'country-markers', () => {
        mapInstanceRef.current!.getCanvas().style.cursor = 'pointer';
      });

      mapInstanceRef.current.on('mouseleave', 'country-markers', () => {
        mapInstanceRef.current!.getCanvas().style.cursor = '';
      });
    }

    // Update regional blocks visualization
    const regionalContainer = document.getElementById('regional-blocks');
    if (regionalContainer) {
      const regions = [
        { name: 'NORTH AMERICA', countries: ['US', 'CA', 'MX'], color: 'bg-blue-500', intensity: 85 },
        { name: 'EUROPE', countries: ['DE', 'GB', 'FR', 'IT'], color: 'bg-green-500', intensity: 72 },
        { name: 'ASIA PACIFIC', countries: ['CN', 'JP', 'KR', 'IN'], color: 'bg-red-500', intensity: 93 },
        { name: 'MIDDLE EAST', countries: ['SA', 'AE', 'QA'], color: 'bg-yellow-500', intensity: 67 },
        { name: 'AFRICA', countries: ['ZA', 'NG', 'EG'], color: 'bg-purple-500', intensity: 45 },
        { name: 'SOUTH AMERICA', countries: ['BR', 'AR', 'CL'], color: 'bg-orange-500', intensity: 58 }
      ];

      regionalContainer.innerHTML = regions.map((region) => {
        const commodityFlow = filteredData
          .filter(trade => region.countries.includes(trade.exporter_code) || region.countries.includes(trade.importer_code))
          .reduce((sum, trade) => sum + trade.value_usd, 0);

        return `
          <div class="col-span-4 ${region.color} bg-opacity-20 border border-current rounded p-2 hover:bg-opacity-30 transition-all cursor-pointer">
            <div class="text-xs text-green-400 font-mono">${region.name}</div>
            <div class="text-xs text-yellow-400 mt-1">$${(commodityFlow / 1000000000).toFixed(1)}B</div>
            <div class="text-xs text-gray-300 mt-1">${region.intensity}% ACTIVITY</div>
            <div class="w-full bg-gray-700 rounded h-1 mt-2">
              <div class="h-1 rounded transition-all duration-1000 ${region.color}" style="width: ${region.intensity}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Update the trade routes display in Bloomberg terminal style
    const routesContainer = document.getElementById('trade-routes');
    if (routesContainer) {
      routesContainer.innerHTML = filteredData
        .sort((a, b) => b.value_usd - a.value_usd)
        .slice(0, 8)
        .map((trade, index) => `
          <div class="flex justify-between items-center text-xs font-mono py-1 border-b border-gray-600">
            <div class="flex items-center space-x-2">
              <span class="text-yellow-400 w-6">${(index + 1).toString().padStart(2, '0')}</span>
              <span class="text-green-400">${trade.exporter_code}</span>
              <span class="text-gray-400">→</span>
              <span class="text-blue-400">${trade.importer_code}</span>
            </div>
            <div class="text-right">
              <div class="text-white">$${(trade.value_usd / 1000000000).toFixed(2)}B</div>
              <div class="text-gray-400 text-xs">${trade.commodity}</div>
            </div>
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