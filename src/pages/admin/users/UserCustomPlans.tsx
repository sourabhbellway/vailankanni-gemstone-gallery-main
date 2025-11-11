import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Coins } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getUserCustomPlans, getUserGoldPlanPayments, type CustomPlan, type GoldPlanPayment } from "@/lib/api/adminUserController";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserCustomPlans = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [customPlans, setCustomPlans] = useState<CustomPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [goldPlanPayments, setGoldPlanPayments] = useState<Record<number, GoldPlanPayment[]>>({});
  const [loadingPayments, setLoadingPayments] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchCustomPlans = async () => {
      if (!token || !userId) return;
      try {
        setLoading(true);
        const response = await getUserCustomPlans(token, Number(userId));
        if (response.status) {
          setCustomPlans(response.data.custom_plan || []);
          setUserName(response.data.name);
        }
      } catch (err: any) {
        console.error("Error fetching custom plans:", err);
        toast({
          title: "Error",
          description: "Failed to load custom plans",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCustomPlans();
  }, [token, userId, toast]);

  const handleTogglePayments = async (goldPlanId: number) => {
    if (goldPlanPayments[goldPlanId]) {
      // Hide payments
      setGoldPlanPayments((prev) => {
        const newPayments = { ...prev };
        delete newPayments[goldPlanId];
        return newPayments;
      });
      return;
    }

    // Fetch payments
    if (!token || !userId) return;
    try {
      setLoadingPayments((prev) => ({ ...prev, [goldPlanId]: true }));
      const response = await getUserGoldPlanPayments(token, Number(userId), goldPlanId);
      if (response.status) {
        setGoldPlanPayments((prev) => ({
          ...prev,
          [goldPlanId]: response.data.payments || [],
        }));
      }
    } catch (err: any) {
      console.error("Error fetching gold plan payments:", err);
      toast({
        title: "Error",
        description: "Failed to load gold plan payments",
        variant: "destructive",
      });
    } finally {
      setLoadingPayments((prev) => ({ ...prev, [goldPlanId]: false }));
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-800";
      case "success": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 w-full justify-between ">
          <div>
            <h1 className="text-3xl font-bold">Custom Plans</h1>
            <p className="text-muted-foreground">{userName || "Loading..."}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <Tabs defaultValue="customPlans" className="space-y-4">
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
      ) : customPlans.length > 0 ? (
        <div className="space-y-4 mt-4">
          {customPlans.map((plan) => (
            <Card key={plan.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium">Custom Plan #{plan.id}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePayments(plan.id)}
                    disabled={loadingPayments[plan.id]}
                  >
                    {loadingPayments[plan.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : goldPlanPayments[plan.id] ? (
                      "Hide Payments"
                    ) : (
                      "View Payments"
                    )}
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm"><span className="font-medium">Invested Amount:</span> ₹{Number(plan.invested_amount).toLocaleString("en-IN")}</p>
                    <p className="text-sm"><span className="font-medium">Gold Grams:</span> {Number(plan.gold_grams).toFixed(4)}g</p>
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">Gold Rate:</span> ₹{Number(plan.gold_rate).toLocaleString("en-IN")}/gram</p>
                    <p className="text-sm"><span className="font-medium">Created:</span> {new Date(plan.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {goldPlanPayments[plan.id] && goldPlanPayments[plan.id].length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Payments:</p>
                    <div className="space-y-2">
                      {goldPlanPayments[plan.id].map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm">Payment #{payment.id}</p>
                            <p className="text-xs text-muted-foreground">Order: {payment.order_id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">₹{Number(payment.amount).toLocaleString("en-IN")}</p>
                            <Badge className={`mt-1 ${getPaymentStatusColor(payment.status)}`}>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 mt-4">
          <Coins className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No custom plans found</p>
        </div>
      )}
    </div>
  );
};

export default UserCustomPlans;

