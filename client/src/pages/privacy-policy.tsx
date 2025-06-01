import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useState } from "react";
import { AddStockModal } from "@/components/add-stock-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-3 md:p-6 pt-16 md:pt-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Introduction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    Redgum & Birch, a subsidiary of Caselka Capital, ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our investment tracking platform and related services.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Information We Collect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Personal Information</h4>
                    <p className="text-gray-700 mb-2">We may collect personal information that you provide directly to us, including:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Name and contact information (email address, phone number)</li>
                      <li>Account credentials and authentication information</li>
                      <li>Payment and billing information for premium services</li>
                      <li>Investment preferences and portfolio data</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Usage Information</h4>
                    <p className="text-gray-700 mb-2">We automatically collect certain information about your use of our platform:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Device information (IP address, browser type, operating system)</li>
                      <li>Usage patterns and interaction data</li>
                      <li>Performance metrics and error logs</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How We Use Your Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">We use the information we collect to:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Provide, maintain, and improve our investment tracking services</li>
                    <li>Process transactions and manage your account</li>
                    <li>Send you important notifications and updates</li>
                    <li>Personalize your experience and provide relevant content</li>
                    <li>Analyze usage patterns to enhance our platform</li>
                    <li>Comply with legal obligations and protect against fraud</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Information Sharing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>With your explicit consent</li>
                    <li>To comply with legal obligations or court orders</li>
                    <li>To protect our rights, property, or safety</li>
                    <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
                    <li>In connection with a merger, acquisition, or sale of assets</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of sensitive data, secure server infrastructure, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Rights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">You have the following rights regarding your personal information:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Access and review your personal information</li>
                    <li>Correct inaccurate or incomplete information</li>
                    <li>Delete your account and associated data</li>
                    <li>Export your data in a portable format</li>
                    <li>Opt-out of certain communications</li>
                    <li>Object to processing based on legitimate interests</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cookies and Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie preferences through your browser settings. Disabling cookies may affect the functionality of our platform.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Third-Party Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    Our platform may integrate with third-party services (such as financial data providers, authentication services, and analytics tools). These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party services.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Children's Privacy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will take steps to delete it promptly.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Changes to This Policy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on our platform and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="text-gray-700">
                    <p><strong>Redgum & Birch</strong></p>
                    <p>A subsidiary of Caselka Capital</p>
                    <p>Email: privacy@redgumbirch.com</p>
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