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
import {
  TrendingUp,
  Package,
  Users,
  IndianRupee,
  Bell,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { name, email } = useAuth();
  // Mock data for demonstration (will use dynamic admin name/email below where applicable)
  const overviewStats = [
    { title: "Total Orders", value: "1,234", change: "+12%", icon: Package },
    { title: "Revenue", value: "₹12,34,567", change: "+8%", icon: IndianRupee },
    { title: "Active Users", value: "456", change: "+5%", icon: Users },
    { title: "Pending Orders", value: "23", change: "-2%", icon: Bell },
  ];

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Vailankanni Admin
              </h1>
              <p className="text-xs text-muted-foreground">
                {email || "admin@example.com"}
              </p>
            </div>
            <Badge variant="secondary">{name || "Admin"}</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {overviewStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from
                  last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Metal Rates */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Today's Metal Rates</CardTitle>
            <CardDescription>Current prices per gram</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Gold (24K)</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ₹{currentRates.gold.rate}
                  </p>
                </div>
                <Badge variant="secondary" className="text-green-600">
                  {currentRates.gold.change}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Silver</p>
                  <p className="text-2xl font-bold text-gray-600">
                    ₹{currentRates.silver.rate}
                  </p>
                </div>
                <Badge variant="secondary" className="text-red-600">
                  {currentRates.silver.change}
                </Badge>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Input placeholder="Gold rate per gram" className="flex-1" />
              <Input placeholder="Silver rate per gram" className="flex-1" />
              <Button>Update Rates</Button>
            </div>
          </CardContent>
        </Card>

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
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "Completed" ? "default" : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
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
    </div>
  );
};

export default AdminDashboard;

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        logout();
        navigate("/login", { replace: true });
      }}
    >
      Logout
    </Button>
  );
};
