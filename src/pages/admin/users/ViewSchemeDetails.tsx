import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getUserWithSchemes, getUserSchemesPayments, type UserScheme, type SchemePayment } from "@/lib/api/adminUserController";

const ViewSchemeDetails = () => {
  const { userId, userSchemeId } = useParams<{ userId: string; userSchemeId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [scheme, setScheme] = useState<UserScheme | null>(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [schemePayments, setSchemePayments] = useState<SchemePayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  useEffect(() => {
    const fetchSchemeDetails = async () => {
      if (!token || !userId || !userSchemeId) return;
      setLoading(true);
      try {
        const response = await getUserWithSchemes(token, Number(userId));
        if (response.status) {
          setUserName(response.data.name);
          const found = (response.data.user_schemes || []).find((s: UserScheme) => s.id === Number(userSchemeId));
          setScheme(found ?? null);
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch scheme details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSchemeDetails();
  }, [token, userId, userSchemeId, toast]);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!token || !userId || !userSchemeId) return;
      setLoadingPayments(true);
      try {
        const resp = await getUserSchemesPayments(token, Number(userId), Number(scheme?.id));
        if (resp.status) {
          setSchemePayments(resp.data.payments || []);
        }
      } finally {
        setLoadingPayments(false);
      }
    };
    if (scheme) fetchPayments();
  }, [token, userId, userSchemeId, scheme]);

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "bg-green-200/70 text-green-800 hover:bg-green-200";
      case "success": return "bg-green-200/70 text-green-800 hover:bg-green-200";
      case "pending": return "bg-yellow-200/70 text-yellow-800 hover:bg-yellow-200";
      case "upcoming": return "bg-blue-200/70 text-blue-800 hover:bg-blue-200";
      case "failed": return "bg-red-200/70 text-red-800 hover:bg-red-200";
      default: return "bg-gray-200/70 text-gray-800 hover:bg-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-80"><Loader2 className="h-8 w-8 animate-spin" /></div>
    );
  }
  if (!scheme) {
    return (
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Scheme Details</h1>
            <p className="text-muted-foreground">{userName}</p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </div>
        <Card><CardContent className="py-16 text-center text-muted-foreground">Scheme not found</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scheme Details #{scheme.id}</h1>
          <p className="text-muted-foreground">{userName}</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>General Info</CardTitle>
          <CardDescription>User’s scheme enrollment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Status</div>
              <Badge className={`capitalize ${scheme.status === "active" ? "bg-green-200/70 text-green-800 hover:bg-green-200" : "bg-blue-200/70 text-blue-800 hover:bg-blue-200"}`}>{scheme.status}</Badge>
            </div>
            <div>
              <div className="text-muted-foreground">Scheme Name</div>
              <div className="font-medium">{scheme.scheme?.scheme || "N/A"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Monthly Amount</div>
              <div className="font-medium">₹{Number(scheme.monthly_amount).toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Paid</div>
              <div className="font-medium">₹{Number(scheme.total_paid).toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Timeline</div>
              <div className="font-medium">{new Date(scheme.start_date).toLocaleDateString()} → {new Date(scheme.end_date).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Maturity Amount</div>
              <div className="font-medium">₹{scheme.scheme?.maturity_amount?.toLocaleString("en-IN")}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Installment Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="py-2 px-2">Installment</th>
                  <th className="py-2 px-2">Due Date</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {schemePayments.length ? schemePayments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 px-2">#{p.installment_number}</td>
                    <td className="py-2 px-2">{new Date(p.due_date).toLocaleDateString()}</td>
                    <td className="py-2 px-2"><Badge className={`capitalize ${getPaymentStatusColor(p.status)}`}>{p.status}</Badge></td>
                    <td className="py-2 px-2">₹{Number(p.amount).toLocaleString("en-IN")}</td>
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

export default ViewSchemeDetails;
