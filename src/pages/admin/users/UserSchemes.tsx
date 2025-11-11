import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getUserWithSchemes, getUserSchemesPayments, type UserScheme, type SchemePayment } from "@/lib/api/adminUserController";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserSchemes = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<UserScheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [schemePayments, setSchemePayments] = useState<Record<number, SchemePayment[]>>({});
  const [loadingPayments, setLoadingPayments] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchSchemes = async () => {
      if (!token || !userId) return;
      try {
        setLoading(true);
        const response = await getUserWithSchemes(token, Number(userId));
        if (response.status) {
          setSchemes(response.data.schemes || []);
          setUserName(response.data.name);
        }
      } catch (err: any) {
        console.error("Error fetching schemes:", err);
        toast({
          title: "Error",
          description: "Failed to load schemes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, [token, userId, toast]);

  const handleTogglePayments = async (schemeId: number) => {
    if (schemePayments[schemeId]) {
      // Hide payments
      setSchemePayments((prev) => {
        const newPayments = { ...prev };
        delete newPayments[schemeId];
        return newPayments;
      });
      return;
    }

    // Fetch payments
    if (!token || !userId) return;
    try {
      setLoadingPayments((prev) => ({ ...prev, [schemeId]: true }));
      const response = await getUserSchemesPayments(token, Number(userId), schemeId);
      if (response.status) {
        setSchemePayments((prev) => ({
          ...prev,
          [schemeId]: response.data.payments || [],
        }));
      }
    } catch (err: any) {
      console.error("Error fetching scheme payments:", err);
      toast({
        title: "Error",
        description: "Failed to load scheme payments",
        variant: "destructive",
      });
    } finally {
      setLoadingPayments((prev) => ({ ...prev, [schemeId]: false }));
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
        <div className="flex items-center gap-4 w-full justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Schemes</h1>
            <p className="text-muted-foreground">{userName || "Loading..."}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <Tabs defaultValue="schemes" className="space-y-4">
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
      ) : schemes.length > 0 ? (
        <div className="space-y-4 mt-4">
          {schemes.map((scheme) => (
            <Card key={scheme.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium">Scheme #{scheme.id}</p>
                    <Badge className={`mt-2 ${scheme.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {scheme.status}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePayments(scheme.scheme_id)}
                    disabled={loadingPayments[scheme.scheme_id]}
                  >
                    {loadingPayments[scheme.scheme_id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : schemePayments[scheme.scheme_id] ? (
                      "Hide Payments"
                    ) : (
                      "View Payments"
                    )}
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm"><span className="font-medium">Scheme ID:</span> {scheme.scheme_id}</p>
                    <p className="text-sm"><span className="font-medium">Monthly Amount:</span> ₹{Number(scheme.monthly_amount).toLocaleString("en-IN")}</p>
                    <p className="text-sm"><span className="font-medium">Total Paid:</span> ₹{Number(scheme.total_paid).toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-medium">Start Date:</span> {new Date(scheme.start_date).toLocaleString()}</p>
                    <p className="text-sm"><span className="font-medium">End Date:</span> {new Date(scheme.end_date).toLocaleString()}</p>
                  </div>
                </div>
                {schemePayments[scheme.scheme_id] && schemePayments[scheme.scheme_id].length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Payments:</p>
                    <div className="space-y-2">
                      {schemePayments[scheme.scheme_id].map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm">Installment #{payment.installment_number}</p>
                            <p className="text-xs text-muted-foreground">Due: {new Date(payment.due_date).toLocaleDateString()}</p>
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
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No schemes found</p>
        </div>
      )}
    </div>
  );
};

export default UserSchemes;

