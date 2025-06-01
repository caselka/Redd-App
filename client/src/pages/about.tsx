export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Redd</h1>
          <p className="text-xl text-gray-600">
            Professional investment tracking and analysis platform for smart investors
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            At Redd, we believe that every investor deserves access to professional-grade tools and insights. 
            Our mission is to democratize investment analysis by providing sophisticated yet accessible 
            technology that helps you make informed investment decisions.
          </p>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Market Data</h3>
              <p className="text-gray-600">
                Access live stock prices, market data, and financial metrics updated in real-time.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">
                Comprehensive portfolio analytics with value investing metrics and performance insights.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Trade Intelligence</h3>
              <p className="text-gray-600">
                Interactive 3D trade map showing global commodity flows and market opportunities.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Tools</h3>
              <p className="text-gray-600">
                Advanced EPV calculator, margin of safety analysis, and fundamental valuation tools.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Company</h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Redd is developed by Redgum & Birch, a subsidiary of Caselka Capital. We combine deep 
            financial expertise with cutting-edge technology to create tools that serve both 
            individual investors and investment professionals.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Founded on the principles of transparency, accuracy, and accessibility, we're committed 
            to providing reliable data and insights that help you navigate the complex world of investing.
          </p>
        </div>

        <div className="bg-red-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of investors who trust Redd for their investment analysis needs.
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Start Your Free Account
          </a>
        </div>
      </div>
    </div>
  );
}