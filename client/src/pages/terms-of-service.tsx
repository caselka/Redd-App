import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useState } from "react";
import { AddStockModal } from "@/components/add-stock-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-3 md:p-6 pt-16 md:pt-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Acceptance of Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    By accessing and using the Redd investment tracking platform operated by Redgum & Birch, a subsidiary of Caselka Capital ("Company," "we," "our," or "us"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our services.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Description of Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Redd is an investment tracking platform that provides tools for:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Portfolio management and performance tracking</li>
                    <li>Stock watchlists and price monitoring</li>
                    <li>Investment analysis tools and calculators</li>
                    <li>Market data and SEC filing access</li>
                    <li>Investment note-taking and research organization</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Accounts and Responsibilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Account Creation</h4>
                    <p className="text-gray-700">
                      You must provide accurate, current, and complete information during registration and keep your account information updated. You are responsible for safeguarding your account credentials and all activities under your account.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Prohibited Uses</h4>
                    <p className="text-gray-700 mb-2">You agree not to use the service:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>For any unlawful purpose or to solicit unlawful acts</li>
                      <li>To violate any international, federal, provincial, or state regulations or laws</li>
                      <li>To transmit malicious code, viruses, or harmful data</li>
                      <li>To attempt to gain unauthorized access to our systems</li>
                      <li>To interfere with the security or proper functioning of the service</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Investment Disclaimer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 font-medium mb-2">IMPORTANT INVESTMENT DISCLAIMER</p>
                    <p className="text-yellow-700 text-sm">
                      The information provided on this platform is for educational and informational purposes only and should not be construed as investment advice. Past performance does not guarantee future results. All investments carry risk of loss.
                    </p>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">
                    We do not provide investment advice, recommendations, or endorsements. You are solely responsible for your investment decisions. We recommend consulting with qualified financial advisors before making investment decisions. Market data may be delayed and should not be relied upon for time-sensitive trading decisions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription and Payment Terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Free and Premium Services</h4>
                    <p className="text-gray-700">
                      We offer both free and premium subscription tiers. Premium features require payment of applicable fees. Subscription fees are billed in advance and are non-refundable except as required by law.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Price Changes</h4>
                    <p className="text-gray-700">
                      We reserve the right to modify subscription prices with 30 days' notice. Price changes will not affect existing subscriptions until renewal.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Cancellation</h4>
                    <p className="text-gray-700">
                      You may cancel your subscription at any time through your account settings. Cancellation will be effective at the end of your current billing period.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Intellectual Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    The service and its original content, features, and functionality are owned by Redgum & Birch and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works of our content without express written permission.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data and Privacy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy. By using our service, you consent to the collection and use of information as outlined in our Privacy Policy. You retain ownership of your investment data and may export or delete it at any time.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    We strive to maintain high service availability but cannot guarantee uninterrupted access. We may temporarily suspend service for maintenance, updates, or due to circumstances beyond our control. We are not liable for any losses resulting from service interruptions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Limitation of Liability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    To the fullest extent permitted by law, Redgum & Birch and Caselka Capital shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or investment losses, whether in an action of contract, negligence, or other tort, arising from your use of the service.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Indemnification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    You agree to defend, indemnify, and hold harmless Redgum & Birch, Caselka Capital, and their officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the service, violation of these terms, or infringement of any rights of another party.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Termination</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason in our sole discretion.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Governing Law</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction where Caselka Capital is incorporated, without regard to its conflict of law provisions. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in that jurisdiction.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Changes to Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by posting the updated terms on our platform and updating the "Last updated" date. Your continued use of the service after such changes constitutes acceptance of the new terms.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    For questions about these Terms of Service, please contact us:
                  </p>
                  <div className="text-gray-700">
                    <p><strong>Redgum & Birch</strong></p>
                    <p>A subsidiary of Caselka Capital</p>
                    <p>Email: legal@redgumbirch.com</p>
                    <p>Support: support@redgumbirch.com</p>
                  </div>
                </CardContent>
              </Card>
            </div>
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