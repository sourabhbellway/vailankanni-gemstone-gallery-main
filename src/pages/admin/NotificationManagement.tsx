import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Send, Bell, Mail, MessageSquare, Users, Calendar, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const NotificationManagement = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Order Confirmation",
      message: "Your order #ORD001 has been confirmed and is being processed.",
      type: "order_update",
      recipient: "customer",
      status: "sent",
      sentAt: "2024-01-20 10:30:00",
      readAt: "2024-01-20 10:35:00"
    },
    {
      id: 2,
      title: "Gold Rate Alert",
      message: "Gold rates have increased by 2.5% today. Current rate: ₹6420/gram",
      type: "price_alert",
      recipient: "all_users",
      status: "sent",
      sentAt: "2024-01-20 09:00:00",
      readAt: null
    },
    {
      id: 3,
      title: "New Collection Launch",
      message: "Discover our latest bridal collection with exclusive designs.",
      type: "promotion",
      recipient: "all_users",
      status: "scheduled",
      scheduledFor: "2024-01-25 08:00:00"
    }
  ]);

  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Order Confirmation",
      subject: "Order Confirmed - #{order_id}",
      message: "Dear {customer_name}, your order #{order_id} has been confirmed and is being processed.",
      type: "order_update",
      isActive: true
    },
    {
      id: 2,
      name: "Price Drop Alert",
      subject: "Price Drop Alert - {product_name}",
      message: "Great news! The price of {product_name} has dropped by {discount}%.",
      type: "price_alert",
      isActive: true
    },
    {
      id: 3,
      name: "Welcome Message",
      subject: "Welcome to Vailankanni Jewellers",
      message: "Welcome {customer_name}! Thank you for joining our jewelry family.",
      type: "welcome",
      isActive: true
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("send");

  const handleSendNotification = () => {
    toast({
      title: "Notification Sent",
      description: "Your notification has been sent successfully to selected recipients."
    });
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "default";
      case "scheduled": return "secondary";
      case "draft": return "outline";
      default: return "secondary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order_update": return <MessageSquare className="h-4 w-4" />;
      case "price_alert": return <Bell className="h-4 w-4" />;
      case "promotion": return <Mail className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Management</h1>
          <p className="text-muted-foreground">
            Send notifications and manage communication with users
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
              <DialogDescription>
                Send a notification to your users
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Notification title" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your notification message" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order_update">Order Update</SelectItem>
                      <SelectItem value="price_alert">Price Alert</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recipient">Recipients</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_users">All Users</SelectItem>
                      <SelectItem value="premium_users">Premium Users</SelectItem>
                      <SelectItem value="recent_customers">Recent Customers</SelectItem>
                      <SelectItem value="custom">Custom Selection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="schedule">Schedule (Optional)</Label>
                <Input id="schedule" type="datetime-local" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendNotification}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Notification
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              Upcoming notifications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,341</div>
            <p className="text-xs text-muted-foreground">
              Notification subscribers
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="send">Recent Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                View and manage sent notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Read Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(notification.type)}
                          <span className="font-medium">{notification.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {notification.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{notification.recipient.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(notification.status) as any}>
                          {notification.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {notification.sentAt || notification.scheduledFor || "Not scheduled"}
                      </TableCell>
                      <TableCell>
                        {notification.readAt ? (
                          <Badge variant="default">Read</Badge>
                        ) : (
                          <Badge variant="secondary">Unread</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>
                Manage reusable notification templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{template.subject}</p>
                      <p className="text-sm mt-2 text-ellipsis overflow-hidden">{template.message}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={template.isActive} />
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure notification preferences and delivery methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch defaultChecked />
                </div> */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                {/* <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                  </div>
                  <Switch />
                </div> */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">WhatsApp Integration</h4>
                    <p className="text-sm text-muted-foreground">Send notifications via WhatsApp</p>
                  </div>
                  <Switch />
                </div>
              </div>
              
              {/* <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Delivery Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batchSize">Batch Size</Label>
                    <Input id="batchSize" type="number" defaultValue="100" />
                  </div>
                  <div>
                    <Label htmlFor="delay">Delay Between Batches (seconds)</Label>
                    <Input id="delay" type="number" defaultValue="30" />
                  </div>
                </div>
              </div> */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationManagement;