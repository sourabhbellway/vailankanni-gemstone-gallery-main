import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Eye,
  Download,
  MessageSquare,
  Package,
  Truck,
  Copy,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { getOrders } from "@/lib/api/ordersController";
const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    completed: 0,
  });

  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const copyToClipboard = useCallback((value?: string) => {
    if (!value) return;
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(value)
        .then(() => {
          setCopiedValue(value);
          setTimeout(() => setCopiedValue(null), 1500);
        })
        .catch(() => {
          // Silently ignore copy failures
        });
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrders(token);
      const apiOrders = response?.data?.data ?? [];
      const counts = response?.data?.status_counts ?? null;

      const formatDate = (iso?: string) => {
        if (!iso) return "";
        try {
          const d = new Date(iso);
          return d.toLocaleString();
        } catch {
          return String(iso);
        }
      };

      const formatStatus = (status?: string) => {
        if (!status) return "Pending";
        const s = status.replace(/_/g, " ");
        return s.charAt(0).toUpperCase() + s.slice(1);
      };

      const normalized = apiOrders.map((o: any) => ({
        id: o.id,
        orderCode: o.order_code,
        customerId: o.customer_id,
        customer: o.customer ?? null,
        totalAmount: o.total_amount,
        finalAmount: o.final_amount,
        discountAmount: o.discount_amount,
        status: formatStatus(o.status),
        rawStatus: o.status ?? "pending",
        deliveryAddress: o.delivery_address ?? "",
        orderDate: formatDate(o.order_date),
        expectedDelivery: o.expected_delivery
          ? formatDate(o.expected_delivery)
          : "—",
        paymentMethod: o.payment_method ?? "",
        razorpayOrderId: o.razorpay_order_id ?? "—",
        razorpayPaymentId: o.razorpay_payment_id ?? "—",
        razorpaySignature: o.razorpay_signature ?? "—",
        notes: o.notes ?? "",
      }));

      setOrders(normalized);
      if (counts) {
        setStatusCounts({
          pending: counts.pending ?? 0,
          processing: counts.processing ?? 0,
          shipped: counts.shipped ?? 0,
          completed: counts.completed ?? 0,
        });
      }
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders. Please try again.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  const statusOptions = [
    "Pending",
    "Processing",
    "Shipped",
    "Completed",
    "Cancelled",
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const OrderDetailsModal = ({ order }: { order: (typeof orders)[0] }) => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="font-semibold mb-2">Customer Information</h3>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Order Code:</strong> {order.orderCode}
            </p>
            <p>
              <strong>Payment:</strong> {order.paymentMethod}
            </p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Order Details</h3>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Order ID:</strong> {order.id}
            </p>
            <p>
              <strong>Order Date:</strong> {order.orderDate}
            </p>
            <p>
              <strong>Expected Delivery:</strong> {order.expectedDelivery}
            </p>
            <p>
              <strong>Status:</strong> {order.status}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Product Information</h3>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Final Amount:</strong> {order.finalAmount}
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Delivery Address</h3>
        <p className="text-sm">{order.deliveryAddress}</p>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Update Order Status</h3>
        <div className="flex gap-4">
          <Select defaultValue={(order.status || "").toLowerCase()}>
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
          <p className="text-muted-foreground">
            Manage customer orders and deliveries
          </p>
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
                <div className="text-2xl font-bold">{statusCounts.pending}</div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {statusCounts.processing}
                </div>
                <p className="text-xs text-muted-foreground">Processing</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{statusCounts.shipped}</div>
                <p className="text-xs text-muted-foreground">Shipped</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {statusCounts.completed}
                </div>
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
                    <TableHead>Order Code</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Final Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Loading orders...
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="text-red-500 mb-2">
                          <p className="text-sm font-medium">
                            Error loading orders
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {error}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchOrders()}
                          className="mt-2"
                        >
                          Retry
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : orders && orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>{order.orderCode}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="capitalize font-semibold">
                              {order.customer?.name}
                            </span>
                            <div className="flex items-center gap-1">
                              <span>{order.customer?.email}</span>
                              {order.customer?.email ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Copy email"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    copyToClipboard(order.customer?.email)
                                  }
                                >
                                  {copiedValue === order.customer?.email ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-1">
                              <span>{order.customer?.mobile}</span>
                              {order.customer?.mobile ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Copy mobile"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    copyToClipboard(order.customer?.mobile)
                                  }
                                >
                                  {copiedValue === order.customer?.mobile ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.finalAmount}
                        </TableCell>
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
                                <DialogTitle>
                                  Order Details - {order.id}
                                </DialogTitle>
                                <DialogDescription>
                                  View and manage order information
                                </DialogDescription>
                              </DialogHeader>
                              <OrderDetailsModal order={order} />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No orders found
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Orders</CardTitle>
              <CardDescription>
                Manage custom jewelry orders and uploads
              </CardDescription>
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
                  <p className="text-muted-foreground">
                    Order analytics chart will be displayed here
                  </p>
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
