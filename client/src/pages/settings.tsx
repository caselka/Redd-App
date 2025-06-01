import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AddStockModal } from "@/components/add-stock-modal";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User, Mail, Shield, Bell, CreditCard, HelpCircle, LogOut, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    priceAlerts: true,
    weeklyReports: true,
    portfolioUpdates: true,
    secFilings: false,
    marketNews: true,
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved.",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-3 md:p-6 pt-16 md:pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600">Manage your account preferences and settings</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Support
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <Input
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <Input
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Password & Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Password</label>
                      <Input type="password" placeholder="Enter current password" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <Input type="password" placeholder="Enter new password" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                      <Input type="password" placeholder="Confirm new password" />
                    </div>

                    <Button variant="outline">
                      Update Password
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable 2FA</p>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Price Alerts</p>
                      <p className="text-sm text-gray-600">Get notified when stocks hit your target prices</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.priceAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, priceAlerts: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Reports</p>
                      <p className="text-sm text-gray-600">Receive weekly portfolio performance summaries</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Portfolio Updates</p>
                      <p className="text-sm text-gray-600">Get notified of significant portfolio changes</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.portfolioUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, portfolioUpdates: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SEC Filings</p>
                      <p className="text-sm text-gray-600">Receive alerts for new SEC filings from your watchlist</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.secFilings}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, secFilings: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Market News</p>
                      <p className="text-sm text-gray-600">Stay updated with relevant market news</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.marketNews}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, marketNews: checked})}
                    />
                  </div>

                  <Button onClick={handleSaveNotifications} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Notification Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Free Plan</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Limited features • Up to 10 stocks</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Upgrade to Pro</h4>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4">
                        <li>• Unlimited stock tracking</li>
                        <li>• Advanced analytics and charts</li>
                        <li>• Real-time price alerts</li>
                        <li>• Premium market insights</li>
                        <li>• Priority customer support</li>
                      </ul>
                      
                      <div className="flex items-center gap-4">
                        <Button>Upgrade to Pro - $19.99/month</Button>
                        <Button variant="outline">Annual Plan - $199.99/year</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">No active subscription</p>
                    <Button variant="outline" className="mt-2">
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="support">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">
                      Need help? Our support team is here to assist you with any questions or issues.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Email Support</h4>
                        <p className="text-sm text-gray-600 mb-2">Get help via email within 24 hours</p>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          support@redgumbirch.com
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Knowledge Base</h4>
                        <p className="text-sm text-gray-600 mb-2">Find answers to common questions</p>
                        <Button variant="outline" size="sm">
                          <HelpCircle className="h-4 w-4 mr-2" />
                          Browse Articles
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Export Data</p>
                        <p className="text-sm text-gray-600">Download your portfolio and notes data</p>
                      </div>
                      <Button variant="outline">
                        Export
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="destructive">
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <AddStockModal 
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
      />
    </div>
  );
}