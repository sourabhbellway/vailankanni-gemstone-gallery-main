import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAnalytics } from "@/lib/api/dashboardController";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ShoppingBag, TrendingUp, DollarSign, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState([]);

  const navigate = useNavigate();
  useEffect(() => {
    getAnalytics(token)
      .then((response) => {
        const data = response;
        console.log(data);
        setStats(data.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  const salesData = [
    { month: "Jan", sales: 65000 },
    { month: "Feb", sales: 59000 },
    { month: "Mar", sales: 80000 },
    { month: "Apr", sales: 81000 },
    { month: "May", sales: 96000 },
    { month: "Jun", sales: 105000 },
  ];

  const categoryData = [
    { name: "Gold Jewelry", value: 45, color: "#FFD700" },
    { name: "Diamond", value: 30, color: "#B9F2FF" },
    { name: "Silver", value: 15, color: "#C0C0C0" },
    { name: "Gemstone", value: 10, color: "#FF6B6B" },
  ];

  const recentOrders = [
    {
      id: "ORD001",
      customer: "Priya Sharma",
      product: "Diamond Necklace",
      amount: "₹45,000",
      status: "Pending",
    },
    {
      id: "ORD002",
      customer: "Rajesh Kumar",
      product: "Gold Ring Set",
      amount: "₹28,000",
      status: "Processing",
    },
    {
      id: "ORD003",
      customer: "Anita Desai",
      product: "Silver Bangles",
      amount: "₹12,000",
      status: "Completed",
    },
  ];

  const currentRates = {
    gold: { rate: 6245, change: "+0.5%" },
    silver: { rate: 78, change: "-0.2%" },
  };

  return (
    <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Orders */}
          <Card className="rounded-2xl shadow bg-blue-50 ">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Orders
              </CardTitle>
              <ShoppingBag className="h-6 w-6 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">
                {stats.total_orders}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Orders placed till date
              </p>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="rounded-2xl shadow bg-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-6 w-6 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">
                ₹{stats.total_revenue}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Gross earnings so far
              </p>
            </CardContent>
          </Card>

          {/* Average Order Value */}
          <Card className="rounded-2xl shadow bg-purple-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg. Order Value
              </CardTitle>
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">
                ₹{stats.average_order_value}
              </div>
              <p className="text-xs text-gray-500 mt-1">Per order on average</p>
            </CardContent>
          </Card>

          {/* Active Customers */}
          <Card className="rounded-2xl shadow bg-rose-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Customers
              </CardTitle>
              <Users className="h-6 w-6 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">
                {stats.active_customers}
              </div>
              <p className="text-xs text-gray-500 mt-1">Engaged this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Monthly sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Sales by jewelry category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

       
      {/* Recent Orders */}
<Card>
  <CardHeader>
    <CardTitle>Recent Orders</CardTitle>
    <CardDescription>Latest customer orders</CardDescription>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Order Date</TableHead>
          <TableHead>Expected Delivery</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
  {stats.recent_orders?.map((order: any) => (
    <TableRow key={order.id}>
      <TableCell className="font-medium">{order.order_code}</TableCell>
      <TableCell>
        {order.customer?.name} <br />
        <span className="text-xs text-gray-500">{order.customer?.email}</span>
      </TableCell>
      <TableCell>₹{parseFloat(order.final_amount).toLocaleString()}</TableCell>
      <TableCell>
        <Badge
          variant={
            order.status === "completed"
              ? "default"
              : order.status === "shipped"
              ? "secondary"
              : "destructive"
          }
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell className="capitalize">{order.payment_method}</TableCell>
      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
      <TableCell>{new Date(order.expected_delivery).toLocaleDateString()}</TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/orders/${order.id}`)}
        >
          View
        </Button>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
    </Table>
  </CardContent>
</Card>

    </div>
  );
};

export default AdminDashboard;
