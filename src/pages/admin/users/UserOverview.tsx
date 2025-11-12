import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, UserX, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getUserList, updateUserStatus, type AdminUser } from "@/lib/api/adminUserController";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserOverview = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token || !userId) return;
      try {
        setLoading(true);
        const response = await getUserList(token);
        if (response.status) {
          const foundUser = response.data.find((u) => u.id === Number(userId));
          if (foundUser) {
            setUser(foundUser);
          } else {
            toast({
              title: "Error",
              description: "User not found",
              variant: "destructive",
            });
            navigate("/admin/users");
          }
        }
      } catch (err: any) {
        console.error("Error fetching user:", err);
        toast({
          title: "Error",
          description: "Failed to load user",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token, userId, navigate, toast]);

  const getStatusColor = (status: number) => {
    return status === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const handleUpdateStatus = async () => {
    if (!token || !user) return;
    const newStatus = user.status === 1 ? 0 : 1;
    try {
      const response = await updateUserStatus(token, user.id, { status: newStatus });
      if (response.status) {
        toast({
          title: "Success",
          description: response.message || "User status updated successfully",
        });
        setUser({ ...user, status: newStatus });
      }
    } catch (err: any) {
      console.error("Error updating user status:", err);
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
       
      
          <div>
            <h1 className="text-3xl font-bold">User Overview</h1>
            <p className="text-muted-foreground">{user.name}</p>
          </div>
    
        <div className="flex items-center gap-4">
          {user.status === 1 ? (
            <Button
              variant="destructive"
              onClick={handleUpdateStatus}
            >
              <UserX className="h-4 w-4 mr-2" />
              Block User
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={handleUpdateStatus}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Unblock User
            </Button>
          )}
              <Button variant="outline" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
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
          <TabsTrigger value="wallet" onClick={() => navigate(`/admin/users/${userId}/wallet`)}>
            Wallet
          </TabsTrigger>
          <TabsTrigger value="vault" onClick={() => navigate(`/admin/users/${userId}/gold-vault`)}>
            Gold vault
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                    <p className="text-sm">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Mobile</Label>
                    <p className="text-sm">{user.mobile || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">User Code</Label>
                    <p className="text-sm">{user.user_code || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                    <p className="text-sm">{user.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                    <p className="text-sm capitalize">{user.role}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status === 1 ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                    <p className="text-sm">{new Date(user.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                    <p className="text-sm">{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Mobile Verified</Label>
                    <p className="text-sm">{user.mobile_verified_at ? new Date(user.mobile_verified_at).toLocaleString() : "Not Verified"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">2FA Verified</Label>
                    <Badge className={user.two_factor_verified === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {user.two_factor_verified === 1 ? "Yes" : "No"}
                    </Badge>
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

export default UserOverview;
