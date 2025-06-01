import { Shield, Lock, Eye, Server, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Security() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Security & Privacy</h1>
          <p className="text-xl text-gray-600">
            Your data security and privacy are our top priorities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-6 w-6 text-green-600 mr-2" />
                Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">End-to-end encryption for all data transmission</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">AES-256 encryption for data at rest</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">Regular security audits and penetration testing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">SOC 2 Type II compliance</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-6 w-6 text-blue-600 mr-2" />
                Access Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">Multi-factor authentication (MFA)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">Role-based access controls</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">Session management and timeout controls</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">Regular access reviews and deprovisioning</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-6 w-6 text-purple-600 mr-2" />
                Privacy Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">GDPR and CCPA compliance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">Data minimization practices</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">Right to data portability and deletion</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">Transparent data collection practices</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="h-6 w-6 text-orange-600 mr-2" />
                Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">Enterprise-grade cloud infrastructure</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">99.9% uptime SLA</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">Automated backups and disaster recovery</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <span className="text-gray-600">24/7 security monitoring</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Security Measures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How We Protect Your Data</h3>
              
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Encryption:</strong> All data is encrypted both in transit and at rest using industry-standard 
                  AES-256 encryption. Communication between your browser and our servers is protected by TLS 1.3.
                </p>
                
                <p>
                  <strong>Authentication:</strong> We support multi-factor authentication and integrate with trusted 
                  identity providers like Google to ensure secure access to your account.
                </p>
                
                <p>
                  <strong>Network Security:</strong> Our infrastructure includes firewalls, DDoS protection, and 
                  intrusion detection systems to prevent unauthorized access.
                </p>
                
                <p>
                  <strong>Data Centers:</strong> Our data is hosted in SOC 2 compliant data centers with physical 
                  security controls, environmental monitoring, and redundant power systems.
                </p>
                
                <p>
                  <strong>Regular Audits:</strong> We conduct regular security assessments, vulnerability scans, 
                  and penetration testing to identify and address potential security issues.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-800">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Report Security Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 mb-4">
              If you discover a security vulnerability, please report it to us immediately. 
              We take all security reports seriously and will respond promptly.
            </p>
            <p className="text-amber-700">
              <strong>Security Email:</strong> security@redd.com<br />
              <strong>PGP Key:</strong> Available upon request
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}