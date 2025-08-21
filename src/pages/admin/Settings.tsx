import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, Upload, Shield, Database, Palette, Globe, Mail, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    general: {
      siteName: "Vailankanni Jewellers",
      siteDescription: "Premium jewelry and gold ornaments",
      currency: "INR",
      timezone: "Asia/Kolkata",
      language: "en",
      maintenance: false
    },
    business: {
      companyName: "Vailankanni Jewellers Pvt Ltd",
      address: "123 Jewelry Street, Mumbai, Maharashtra 400001",
      phone: "+91 98765 43210",
      email: "info@vailankannijewellers.com",
      gst: "27ABCDE1234F1Z5",
      pan: "ABCDE1234F"
    },
    payment: {
      razorpayEnabled: true,
      stripeEnabled: false,
      codEnabled: true,
      emiEnabled: true,
      walletEnabled: true
    },
    inventory: {
      lowStockAlert: 10,
      autoReorder: false,
      trackSerial: true,
      barcodeEnabled: true
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordPolicy: "strong",
      auditLog: true
    }
  });

  const handleSave = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully.`
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your application settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
              <CardDescription>
                Configure basic site settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input 
                    id="siteName" 
                    value={settings.general.siteName}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, siteName: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.general.currency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea 
                  id="siteDescription" 
                  value={settings.general.siteDescription}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, siteDescription: e.target.value }
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.general.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Default Language</Label>
                  <Select value={settings.general.language}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Maintenance Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to restrict access to the site
                  </p>
                </div>
                <Switch 
                  checked={settings.general.maintenance}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    general: { ...settings.general, maintenance: checked }
                  })}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("General")}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Configure your business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName" 
                  value={settings.business.companyName}
                />
              </div>
              
              <div>
                <Label htmlFor="address">Business Address</Label>
                <Textarea 
                  id="address" 
                  value={settings.business.address}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={settings.business.phone} />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={settings.business.email} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gst">GST Number</Label>
                  <Input id="gst" value={settings.business.gst} />
                </div>
                <div>
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input id="pan" value={settings.business.pan} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("Business")}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Methods</span>
              </CardTitle>
              <CardDescription>
                Configure payment gateways and methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Razorpay</h4>
                    <p className="text-sm text-muted-foreground">Accept payments via Razorpay gateway</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={settings.payment.razorpayEnabled ? "default" : "secondary"}>
                      {settings.payment.razorpayEnabled ? "Active" : "Inactive"}
                    </Badge>
                    <Switch checked={settings.payment.razorpayEnabled} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cash on Delivery</h4>
                    <p className="text-sm text-muted-foreground">Allow customers to pay on delivery</p>
                  </div>
                  <Switch checked={settings.payment.codEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">EMI Options</h4>
                    <p className="text-sm text-muted-foreground">Enable EMI payment options</p>
                  </div>
                  <Switch checked={settings.payment.emiEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Digital Wallet</h4>
                    <p className="text-sm text-muted-foreground">Accept digital wallet payments</p>
                  </div>
                  <Switch checked={settings.payment.walletEnabled} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Payment Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="razorpayKey">Razorpay Key ID</Label>
                    <Input id="razorpayKey" type="password" placeholder="Enter Razorpay Key" />
                  </div>
                  <div>
                    <Label htmlFor="razorpaySecret">Razorpay Secret</Label>
                    <Input id="razorpaySecret" type="password" placeholder="Enter Razorpay Secret" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("Payment")}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Inventory Management</span>
              </CardTitle>
              <CardDescription>
                Configure inventory tracking and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lowStockAlert">Low Stock Alert Threshold</Label>
                  <Input 
                    id="lowStockAlert" 
                    type="number" 
                    value={settings.inventory.lowStockAlert}
                  />
                </div>
                <div>
                  <Label htmlFor="reorderLevel">Auto Reorder Level</Label>
                  <Input id="reorderLevel" type="number" placeholder="5" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto Reorder</h4>
                    <p className="text-sm text-muted-foreground">Automatically create purchase orders when stock is low</p>
                  </div>
                  <Switch checked={settings.inventory.autoReorder} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Serial Number Tracking</h4>
                    <p className="text-sm text-muted-foreground">Track individual items by serial numbers</p>
                  </div>
                  <Switch checked={settings.inventory.trackSerial} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Barcode System</h4>
                    <p className="text-sm text-muted-foreground">Enable barcode scanning for inventory</p>
                  </div>
                  <Switch checked={settings.inventory.barcodeEnabled} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("Inventory")}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>
                Configure security policies and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin access</p>
                  </div>
                  <Switch checked={settings.security.twoFactorAuth} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Audit Logging</h4>
                    <p className="text-sm text-muted-foreground">Log all admin actions for security</p>
                  </div>
                  <Switch checked={settings.security.auditLog} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input 
                    id="sessionTimeout" 
                    type="number" 
                    value={settings.security.sessionTimeout}
                  />
                </div>
                <div>
                  <Label htmlFor="passwordPolicy">Password Policy</Label>
                  <Select value={settings.security.passwordPolicy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weak">Weak (6+ characters)</SelectItem>
                      <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                      <SelectItem value="strong">Strong (12+ chars, mixed case, numbers, symbols)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("Security")}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
              <CardDescription>
                Configure external service integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">WhatsApp Business API</h4>
                    <p className="text-sm text-muted-foreground">Send order updates via WhatsApp</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Not Connected</Badge>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Google Analytics</h4>
                    <p className="text-sm text-muted-foreground">Track website analytics and user behavior</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Connected</Badge>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Email Service (SMTP)</h4>
                    <p className="text-sm text-muted-foreground">Configure email delivery service</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Connected</Badge>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Gold Rate API</h4>
                    <p className="text-sm text-muted-foreground">Auto-update gold/silver rates from external API</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Not Connected</Badge>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("Integrations")}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;