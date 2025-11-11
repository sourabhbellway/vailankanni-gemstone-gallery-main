import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getUserWithCustomOrders, type CustomOrder } from "@/lib/api/adminUserController";
import { getImageUrl } from "@/config";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserCustomOrders = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchCustomOrders = async () => {
      if (!token || !userId) return;
      try {
        setLoading(true);
        const response = await getUserWithCustomOrders(token, Number(userId));
        if (response.status) {
          setCustomOrders(response.data.custom_orders || []);
          setUserName(response.data.name);
        }
      } catch (err: any) {
        console.error("Error fetching custom orders:", err);
        toast({
          title: "Error",
          description: "Failed to load custom orders",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomOrders();
  }, [token, userId, toast]);

  const getCustomOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "in_progress": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 w-full justify-between">
          <div className="">
            <h1 className="text-3xl font-bold">Custom Orders</h1>
            <p className="text-muted-foreground">{userName || "Loading..."}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <Tabs defaultValue="customOrders" className="space-y-4">
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
      ) : customOrders.length > 0 ? (
        <div className="space-y-4 mt-4">
          {customOrders.map((order) => {
            let images: string[] = [];
            try {
              const parsed = JSON.parse(order.design_image);
              images = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              images = [order.design_image];
            }
            return (
              <Card key={order.id}>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">Custom Order #{order.id}</p>
                        <Badge className={`mt-2 ${getCustomOrderStatusColor(order.status)}`}>
                          {order.status}
                        </Badge>
                      </div>
                      {order.price && (
                        <p className="text-sm font-semibold">₹{Number(order.price).toLocaleString("en-IN")}</p>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm"><span className="font-medium">Metal:</span> {order.metal}</p>
                        <p className="text-sm"><span className="font-medium">Purity:</span> {order.purity}</p>
                        <p className="text-sm"><span className="font-medium">Size:</span> {order.size}</p>
                        <p className="text-sm"><span className="font-medium">Weight:</span> {order.weight}g</p>
                      </div>
                      <div>
                        <p className="text-sm"><span className="font-medium">Created:</span> {new Date(order.created_at).toLocaleString()}</p>
                        <p className="text-sm"><span className="font-medium">Updated:</span> {new Date(order.updated_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Description:</p>
                      <p className="text-sm text-muted-foreground">{order.description}</p>
                    </div>
                    {order.note && (
                      <div>
                        <p className="text-sm font-medium">Note:</p>
                        <p className="text-sm text-muted-foreground">{order.note}</p>
                      </div>
                    )}
                    {order.admin_note && (
                      <div>
                        <p className="text-sm font-medium">Admin Note:</p>
                        <p className="text-sm text-muted-foreground">{order.admin_note}</p>
                      </div>
                    )}
                    {images.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Design Images:</p>
                        <div className="grid grid-cols-4 gap-2">
                          {images.map((img, idx) => (
                            <img
                              key={idx}
                              src={getImageUrl(img)}
                              alt={`Design ${idx + 1}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 mt-4">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No custom orders found</p>
        </div>
      )}
    </div>
  );
};

export default UserCustomOrders;

