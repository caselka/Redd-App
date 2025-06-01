import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Eye, 
  TrendingUp, 
  Calculator, 
  Bell, 
  BarChart3, 
  Globe, 
  Shield,
  Zap,
  MapPin,
  Smartphone,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Eye,
      title: "Stock Watchlist",
      description: "Track your favorite stocks with real-time price updates and margin of safety calculations.",
      features: ["Real-time price monitoring", "Margin of safety alerts", "Intrinsic value tracking", "Custom price targets"]
    },
    {
      icon: TrendingUp,
      title: "Portfolio Tracking",
      description: "Comprehensive portfolio management with cost basis tracking and performance analytics.",
      features: ["Multiple transactions per ticker", "Cost basis calculations", "Performance metrics", "Dividend tracking"]
    },
    {
      icon: Calculator,
      title: "Valuation Tools",
      description: "Professional-grade valuation calculators for value investing analysis.",
      features: ["EPV calculator", "DCF modeling", "Financial ratios", "Comparative analysis"]
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Get notified when stocks hit your target prices or margin of safety thresholds.",
      features: ["Price alerts", "Telegram notifications", "Email updates", "Custom thresholds"]
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive analytics and reporting for your investment performance.",
      features: ["Performance charts", "Risk analysis", "Sector allocation", "Historical trends"]
    },
    {
      icon: Globe,
      title: "Global Trade Intelligence",
      description: "Interactive world map showing global trade flows and commodity data.",
      features: ["Trade flow visualization", "Commodity tracking", "Country statistics", "Economic indicators"]
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Enterprise-grade security to protect your investment data.",
      features: ["End-to-end encryption", "Two-factor authentication", "Secure data storage", "Privacy controls"]
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Access your portfolio and watchlist anywhere with our mobile-responsive design.",
      features: ["Responsive design", "Touch-friendly interface", "Offline capabilities", "Fast loading"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Redd</span>
              <Badge variant="secondary" className="text-xs">by Redgum & Birch</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/">Home</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for Smart Investing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Discover all the tools and features that make Redd the ultimate platform for value investors and portfolio managers.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Smart Investing?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Join thousands of investors who trust Redd for their investment analysis and portfolio management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/login">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-xl font-bold">Redd</span>
              </div>
              <p className="text-gray-400">
                Professional investment tracking and analysis platform for smart investors.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
                <li><Link href="/mobile-app" className="hover:text-white">Mobile App</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/security" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Redgum & Birch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}