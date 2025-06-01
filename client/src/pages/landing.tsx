import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StockPriceChart } from "@/components/stock-price-chart";
import { StatsCards } from "@/components/stats-cards";
import { NewsPanel } from "@/components/news-panel";
import { ClickableTicker } from "@/components/ui/clickable-ticker";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  Globe, 
  Calculator, 
  Bell, 
  BarChart3, 
  Eye,
  MapPin,
  Smartphone,
  Zap,
  Star,
  CheckCircle,
  Menu,
  X
} from "lucide-react";

// Custom Link component that scrolls to top on navigation
const ScrollToTopLink = ({ href, children, className, ...props }: any) => {
  const handleClick = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};

export default function Landing() {
  const [selectedFeature, setSelectedFeature] = useState("watchlist");
  const [isVisible, setIsVisible] = useState({
    hero: false,
    stats: false,
    features: false,
    news: false,
    testimonials: false,
    pricing: false,
    cta: false
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.getAttribute('data-section');
            if (section) {
              setIsVisible(prev => ({ ...prev, [section]: true }));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe sections
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => observer.observe(section));

    // Trigger hero animation on load
    setTimeout(() => {
      setIsVisible(prev => ({ ...prev, hero: true }));
    }, 100);

    return () => observer.disconnect();
  }, []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch stats for public display
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
  }) as { data?: any };

  const features = [
    {
      id: "watchlist",
      icon: <Eye className="h-6 w-6" />,
      title: "Smart Watchlist",
      description: "Track your favorite stocks with real-time prices and margin of safety calculations"
    },
    {
      id: "portfolio",
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Portfolio Analytics",
      description: "Comprehensive portfolio tracking with performance insights and value investing metrics"
    },
    {
      id: "trademap",
      icon: <Globe className="h-6 w-6" />,
      title: "Global Trade Intelligence",
      description: "Interactive 3D trade map showing global commodity flows and market opportunities"
    },
    {
      id: "calculator",
      icon: <Calculator className="h-6 w-6" />,
      title: "EPV Calculator",
      description: "Advanced Earnings Power Value calculator for fundamental analysis"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Portfolio Manager",
      content: "Redd has transformed how I analyze investments. The margin of safety calculations are incredibly accurate.",
      rating: 5
    },
    {
      name: "Michael Torres",
      role: "Value Investor",
      content: "The Global Trade Intelligence Map gives me insights I can't find anywhere else. Game changer.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Financial Analyst",
      content: "Perfect for value investing. The EPV calculator and real-time alerts keep me ahead of the market.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "Track up to 10 stocks",
        "Basic portfolio analytics",
        "Email alerts",
        "Mobile app access"
      ],
      buttonText: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      description: "For serious investors",
      features: [
        "Unlimited stock tracking",
        "Advanced portfolio analytics",
        "Real-time Telegram alerts",
        "Global Trade Intelligence Map",
        "Premium EPV Calculator",
        "Priority support"
      ],
      buttonText: "Upgrade to Pro",
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Redd</span>
              <Badge variant="secondary" className="text-xs">by Redgum & Birch</Badge>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </div>

            {/* Mobile Navigation Button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-40">
              <div className="px-4 py-6 space-y-4">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/about">About</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/contact">Contact</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/privacy-policy">Privacy Policy</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/terms-of-service">Terms of Service</Link>
                </Button>
                <hr className="my-4" />
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button className="w-full bg-red-600 hover:bg-red-700" asChild>
                  <Link href="/login">Get Started</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8" data-section="hero">
        <div className="max-w-7xl mx-auto">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
            isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className={`transition-all duration-1000 delay-200 ${
              isVisible.hero ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}>
              <Badge className="mb-4 bg-red-100 text-red-700 hover:bg-red-200">
                🚀 Now with Global Trade Intelligence
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Smart Investment
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-700">
                  {" "}Tracking
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Professional-grade investment platform with real-time market data, 
                advanced analytics, and global trade intelligence. Make smarter 
                investment decisions with our comprehensive value investing tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white" asChild>
                  <Link href="/login">
                    Start Investing <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Free to start
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Real-time data
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  No credit card required
                </div>
              </div>
            </div>
            <div className={`relative transition-all duration-1000 delay-400 ${
              isVisible.hero ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}>
              <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 border">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Live Market Data</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs sm:text-sm text-gray-500">
                        <ClickableTicker ticker="AAPL" companyName="Apple Inc." />
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-gray-900">$200.85</div>
                      <div className="text-xs sm:text-sm text-green-600">+2.4%</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs sm:text-sm text-gray-500">
                        <ClickableTicker ticker="MSFT" companyName="Microsoft Corporation" />
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-gray-900">$460.36</div>
                      <div className="text-xs sm:text-sm text-green-600">+1.8%</div>
                    </div>
                  </div>
                </div>
                <div className="h-72 sm:h-80 lg:h-96">
                  <StockPriceChart ticker="AAPL" />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full opacity-20"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Smart Investors</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of investors who use Redd to make informed investment decisions
            </p>
          </div>
          <StatsCards stats={stats} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Smart Investing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From real-time market data to global trade intelligence, 
              Redd provides professional-grade tools for every investor.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                {features.map((feature) => (
                  <Card
                    key={feature.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedFeature === feature.id 
                        ? 'ring-2 ring-red-500 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedFeature(feature.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${
                          selectedFeature === feature.id 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                          <p className="text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border">
              {selectedFeature === "watchlist" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Smart Watchlist Demo</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">
                          <ClickableTicker ticker="PLAB" companyName="Photronics Inc." />
                        </div>
                        <div className="text-sm text-gray-500">Photronics Inc.</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$16.71</div>
                        <Badge className="bg-green-100 text-green-700">33.2% MoS</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">
                          <ClickableTicker ticker="V" companyName="Visa Inc." />
                        </div>
                        <div className="text-sm text-gray-500">Visa Inc.</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$365.19</div>
                        <Badge className="bg-red-100 text-red-700">-30.4% MoS</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {selectedFeature === "portfolio" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Portfolio Analytics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500">Total Value</div>
                      <div className="text-2xl font-bold text-gray-900">$125,430</div>
                      <div className="text-sm text-green-600">+12.4%</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500">Today's Gain</div>
                      <div className="text-2xl font-bold text-gray-900">$2,340</div>
                      <div className="text-sm text-green-600">+1.9%</div>
                    </div>
                  </div>
                </div>
              )}
              {selectedFeature === "trademap" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Global Trade Intelligence</h3>
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 text-center">
                    <Globe className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Interactive 3D globe showing global commodity flows and trade opportunities</p>
                  </div>
                </div>
              )}
              {selectedFeature === "calculator" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">EPV Calculator</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue (TTM)</span>
                      <span className="font-semibold">$394.3B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">EBIT Margin</span>
                      <span className="font-semibold">30.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax Rate</span>
                      <span className="font-semibold">15.0%</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">EPV per Share</span>
                      <span className="font-bold text-green-600">$185.20</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Informed</h2>
            <p className="text-gray-600">Latest market news and insights integrated into your dashboard</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <NewsPanel />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied investors</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that's right for you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-red-500 shadow-lg' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.price}
                    <span className="text-lg text-gray-500">/month</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/login">{plan.buttonText}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Investment Strategy?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Join thousands of smart investors who use Redd to make better investment decisions.
            Start your free account today and get immediate access to professional-grade tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100" asChild>
              <Link href="/login">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100" asChild>
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
              <p className="text-gray-400 mb-4">
                Professional investment tracking and analysis platform for smart investors.
              </p>
              <p className="text-sm text-gray-500">
                © 2025 Redgum & Birch, a subsidiary of Caselka Capital. All rights reserved.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><ScrollToTopLink href="/features" className="hover:text-white">Features</ScrollToTopLink></li>
                <li><ScrollToTopLink href="/pricing" className="hover:text-white">Pricing</ScrollToTopLink></li>
                <li><ScrollToTopLink href="/api" className="hover:text-white">API</ScrollToTopLink></li>
                <li><ScrollToTopLink href="/mobile-app" className="hover:text-white">Mobile App</ScrollToTopLink></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><ScrollToTopLink href="/about" className="hover:text-white">About</ScrollToTopLink></li>
                <li><ScrollToTopLink href="/blog" className="hover:text-white">Blog</ScrollToTopLink></li>
                <li><ScrollToTopLink href="/careers" className="hover:text-white">Careers</ScrollToTopLink></li>
                <li><ScrollToTopLink href="/contact" className="hover:text-white">Contact</ScrollToTopLink></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><ScrollToTopLink href="/help" className="hover:text-white">Help Center</ScrollToTopLink></li>
                <li><ScrollToTopLink href="/terms-of-service" className="hover:text-white">Terms of Service</ScrollToTopLink></li>
                <li><ScrollToTopLink href="/privacy-policy" className="hover:text-white">Privacy Policy</ScrollToTopLink></li>
                <li><ScrollToTopLink href="/security" className="hover:text-white">Security</ScrollToTopLink></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}