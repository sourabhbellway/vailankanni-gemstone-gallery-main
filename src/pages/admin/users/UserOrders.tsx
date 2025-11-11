import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getUserWithOrders, type Order } from "@/lib/api/adminUserController";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserOrders = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token || !userId) return;
      try {
        setLoading(true);
        const response = await getUserWithOrders(token, Number(userId));
        if (response.status) {
          setOrders(response.data.orders || []);
          setUserName(response.data.name);
        }
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token, userId, toast]);

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
       
         
          <div>
            <h1 className="text-3xl font-bold">User Orders</h1>
            <p className="text-muted-foreground">{userName || "Loading..."}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" onClick={() => navigate(`/admin/users/${userId}/overview`)}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="orders" onClick={() => navigate(`/admin/users/${userId}/orders`)}>
            Orders
          </TabsTrigger>
          <TabsTrigger value="customOrders" onClick={() => navigate(`/admin/users/${userId}/custom-orders`)}>
            Custom Orders
          </TabsTrigger>
          <TabsTrigger value="schemes" onClick={() => navigate(`/admin/users/${userId}/schemes`)}>
            Schemes
          </TabsTrigger>
          <TabsTrigger value="customPlans" onClick={() => navigate(`/admin/users/${userId}/custom-plans`)}>
            Custom Plans
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4 mt-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Order Code: {order.order_code}</p>
                    <p className="text-sm text-muted-foreground">ID: {order.id}</p>
                    <Badge className={`mt-2 ${getOrderStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">Total:</span> ₹{Number(order.total_amount).toLocaleString("en-IN")}</p>
                    {order.discount_amount && (
                      <p className="text-sm"><span className="font-medium">Discount:</span> ₹{Number(order.discount_amount).toLocaleString("en-IN")}</p>
                    )}
                    <p className="text-sm"><span className="font-medium">Final:</span> ₹{Number(order.final_amount).toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">Payment:</span> {order.payment_method}</p>
                    <p className="text-sm"><span className="font-medium">Order Date:</span> {new Date(order.order_date).toLocaleString()}</p>
                    <p className="text-sm"><span className="font-medium">Expected Delivery:</span> {new Date(order.expected_delivery).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">Address:</span></p>
                    <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                    {order.notes && (
                      <p className="text-sm mt-2"><span className="font-medium">Notes:</span> {order.notes}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 mt-4">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No orders found</p>
        </div>
      )}
    </div>
  );
};

export default UserOrders;

