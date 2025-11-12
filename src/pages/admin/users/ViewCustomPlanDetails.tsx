import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getUserCustomPlans, getUserGoldPlanPayments, type CustomPlan, type GoldPlanPayment } from "@/lib/api/adminUserController";

const ViewCustomPlanDetails = () => {
  const { userId, customPlanId } = useParams<{ userId: string; customPlanId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [plan, setPlan] = useState<CustomPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [payments, setPayments] = useState<GoldPlanPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!token || !userId || !customPlanId) return;
      setLoading(true);
      try {
        const response = await getUserCustomPlans(token, Number(userId));
        if (response.status) {
          setUserName(response.data.name);
          const found = (response.data.custom_plan || []).find((p: CustomPlan) => p.id === Number(customPlanId));
          setPlan(found ?? null);
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch plan details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPlanDetails();
  }, [token, userId, customPlanId, toast]);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!token || !userId || !customPlanId) return;
      setLoadingPayments(true);
      try {
        const resp = await getUserGoldPlanPayments(token, Number(userId), Number(plan?.id));
        if (resp.status) {
          setPayments(resp.data.payments || []);
        }
      } finally {
        setLoadingPayments(false);
      }
    };
    if (plan) fetchPayments();
  }, [token, userId, customPlanId, plan]);

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "bg-green-200/70 text-green-800 hover:bg-green-200";
      case "success": return "bg-green-200/70 text-green-800 hover:bg-green-200";
      case "pending": return "bg-yellow-200/70 text-yellow-800 hover:bg-yellow-200";
      case "upcoming": return "bg-blue-200/70 text-blue-800 hover:bg-blue-200";
      case "failed": return "bg-red-200/70 text-red-800 hover:bg-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-80"><Loader2 className="h-8 w-8 animate-spin" /></div>
    );
  }
  if (!plan) {
    return (
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Custom Plan Details</h1>
            <p className="text-muted-foreground">{userName}</p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </div>
        <Card><CardContent className="py-16 text-center text-muted-foreground">Custom plan not found</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Custom Plan Details #{plan.id}</h1>
          <p className="text-muted-foreground">{userName}</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>General Info</CardTitle>
          <CardDescription>User’s custom plan details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Invested Amount</div>
              <div className="font-medium">₹{Number(plan.invested_amount).toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Gold Grams</div>
              <div className="font-medium">{Number(plan.gold_grams).toFixed(4)} g</div>
            </div>
            <div>
              <div className="text-muted-foreground">Gold Rate</div>
              <div className="font-medium">₹{Number(plan.gold_rate).toLocaleString("en-IN")}/g</div>
            </div>
            <div>
              <div className="text-muted-foreground">Created</div>
              <div className="font-medium">{new Date(plan.created_at).toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="py-2 px-2">Payment ID</th>
                  <th className="py-2 px-2">Order</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.length ? payments.map((pay) => (
                  <tr key={pay.id}>
                    <td className="py-2 px-2">#{pay.id}</td>
                    <td className="py-2 px-2">{pay.order_id}</td>
                    <td className="py-2 px-2"><Badge className={`capitalize ${getPaymentStatusColor(pay.status)}`}>{pay.status}</Badge></td>
                    <td className="py-2 px-2">₹{Number(pay.amount).toLocaleString("en-IN")}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center text-sm text-muted-foreground py-6">
                      {loadingPayments ? "Loading payments..." : "No payments"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewCustomPlanDetails;
