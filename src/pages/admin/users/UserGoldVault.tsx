import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, Gold, Loader2, PlusCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const UserGoldVault = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const run = async () => {
      if (!token || !userId) return;
      setLoading(true);
      try {
        // integrate later
        setUserName(`User #${userId}`);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token, userId]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 w-full justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gold Vault</h1>
            <p className="text-muted-foreground">{userName || "Loading..."}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <Tabs defaultValue="vault" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" onClick={() => navigate(`/admin/users/${userId}/overview`)}>Overview</TabsTrigger>
          <TabsTrigger value="orders" onClick={() => navigate(`/admin/users/${userId}/orders`)}>Orders</TabsTrigger>
          <TabsTrigger value="customOrders" onClick={() => navigate(`/admin/users/${userId}/custom-orders`)}>Custom Orders</TabsTrigger>
          <TabsTrigger value="schemes" onClick={() => navigate(`/admin/users/${userId}/schemes`)}>Schemes</TabsTrigger>
          <TabsTrigger value="customPlans" onClick={() => navigate(`/admin/users/${userId}/custom-plans`)}>Custom Plans</TabsTrigger>
          <TabsTrigger value="wallet" onClick={() => navigate(`/admin/users/${userId}/wallet`)}>Wallet</TabsTrigger>
          <TabsTrigger value="vault" onClick={() => navigate(`/admin/users/${userId}/gold-vault`)}>Gold Vault</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-3 mt-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Holdings
            </CardTitle>
            <CardDescription>Secure gold balance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold">0.000 g</div>
            <div className="text-sm text-muted-foreground">Approx value: ₹0</div>
            <div className="flex gap-2 pt-2">
              <Button size="sm"><PlusCircle className="h-4 w-4 mr-2" />Buy Gold</Button>
              <Button size="sm" variant="outline">Sell</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Vault Activity</CardTitle>
            <CardDescription>Buys, sells, and transfers</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center">
                No activity yet. API integration pending.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserGoldVault;


