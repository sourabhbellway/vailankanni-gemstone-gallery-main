import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, Download, MessageSquare, Package, Truck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data
  const orders = [
    {
      id: "ORD001",
      customer: "Priya Sharma",
      email: "priya@email.com",
      phone: "+91 98765 43210",
      product: "Diamond Engagement Ring",
      quantity: 1,
      amount: "₹45,000",
      status: "Pending",
      orderDate: "2024-01-15",
      expectedDelivery: "2024-01-25",
      paymentMethod: "UPI",
      address: "123 MG Road, Panjim, Goa - 403001"
    },
    {
      id: "ORD002",
      customer: "Rajesh Kumar",
      email: "rajesh@email.com",
      phone: "+91 87654 32109",
      product: "Gold Chain Necklace",
      quantity: 1,
      amount: "₹28,000",
      status: "Processing",
      orderDate: "2024-01-14",
      expectedDelivery: "2024-01-22",
      paymentMethod: "Card",
      address: "456 Church Street, Margao, Goa - 403601"
    },
    {
      id: "ORD003",
      customer: "Anita Desai",
      email: "anita@email.com",
      phone: "+91 76543 21098",
      product: "Silver Bangles Set",
      quantity: 2,
      amount: "₹12,000",
      status: "Shipped",
      orderDate: "2024-01-12",
      expectedDelivery: "2024-01-18",
      paymentMethod: "NetBanking",
      address: "789 Beach Road, Calangute, Goa - 403516"
    },
    {
      id: "ORD004",
      customer: "Vikram Singh",
      email: "vikram@email.com",
      phone: "+91 65432 10987",
      product: "Bridal Jewelry Set",
      quantity: 1,
      amount: "₹85,000",
      status: "Completed",
      orderDate: "2024-01-10",
      expectedDelivery: "2024-01-16",
      paymentMethod: "EMI",
      address: "321 Market Square, Vasco, Goa - 403802"
    },
  ];

  const statusOptions = ["Pending", "Processing", "Shipped", "Completed", "Cancelled"];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Processing": return "bg-blue-100 text-blue-800";
      case "Shipped": return "bg-purple-100 text-purple-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const OrderDetailsModal = ({ order }: { order: typeof orders[0] }) => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="font-semibold mb-2">Customer Information</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Name:</strong> {order.customer}</p>
            <p><strong>Email:</strong> {order.email}</p>
            <p><strong>Phone:</strong> {order.phone}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Order Details</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Date:</strong> {order.orderDate}</p>
            <p><strong>Payment:</strong> {order.paymentMethod}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Product Information</h3>
        <div className="space-y-1 text-sm">
          <p><strong>Product:</strong> {order.product}</p>
          <p><strong>Quantity:</strong> {order.quantity}</p>
          <p><strong>Amount:</strong> {order.amount}</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Delivery Address</h3>
        <p className="text-sm">{order.address}</p>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Update Order Status</h3>
        <div className="flex gap-4">
          <Select defaultValue={order.status.toLowerCase()}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status.toLowerCase()}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>Update Status</Button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Add Order Notes</h3>
        <Textarea placeholder="Add internal notes about this order..." />
        <Button className="mt-2">Add Note</Button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Invoice
        </Button>
        <Button variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" />
          Contact Customer
        </Button>
        <Button variant="outline">
          <Package className="mr-2 h-4 w-4" />
          Track Package
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Manage customer orders and deliveries</p>
        </div>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">All Orders</TabsTrigger>
          <TabsTrigger value="custom">Custom Orders</TabsTrigger>
          <TabsTrigger value="analytics">Order Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders by ID, customer name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status.toLowerCase()}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">Pending Orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">Processing</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Shipped</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Orders ({orders.length})</CardTitle>
              <CardDescription>Manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer}</div>
                          <div className="text-sm text-muted-foreground">{order.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell className="font-medium">{order.amount}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>{order.expectedDelivery}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Order Details - {order.id}</DialogTitle>
                              <DialogDescription>
                                View and manage order information
                              </DialogDescription>
                            </DialogHeader>
                            <OrderDetailsModal order={order} />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Orders</CardTitle>
              <CardDescription>Manage custom jewelry orders and uploads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No custom orders</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Custom orders will appear here when customers upload designs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Trends</CardTitle>
                <CardDescription>Monthly order statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Order analytics chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best selling items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Diamond Rings</span>
                    <span className="text-sm font-medium">45 orders</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gold Necklaces</span>
                    <span className="text-sm font-medium">32 orders</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Silver Bangles</span>
                    <span className="text-sm font-medium">28 orders</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderManagement;