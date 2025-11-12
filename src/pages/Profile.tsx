import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUserProfile } from "@/lib/api/userController";
import { getCartItems } from "@/lib/api/cartController";
import { getWishlistItems } from "@/lib/api/wishlistController";
import { getOrders } from "@/lib/api/orderController";
import { getMyCustomOrders, type CustomOrder } from "@/lib/api/customOrderController";
import { useUserAuth } from "@/context/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import {  Heart, User, Package, LogOut, Calendar, IndianRupee, Clock, CheckCircle2, Layers, Sparkles, Wallet as WalletIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMyPlans, createNextInstallmentOrder, verifySchemePaymentCashfree } from "@/lib/api/userSchemesController";
import { load } from "@cashfreepayments/cashfree-js";
import { extractCashfreeSessionId } from "@/lib/api/customGoldPlanController";
import { getGoldInvestments, type GoldInvestmentsSummary } from "@/lib/api/userController";
import { getImageUrl } from "@/config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getUserWallet, type WalletTransaction } from "@/lib/api/walletController";
import ProfileLayout from "@/components/ProfileLayout";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useUserAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<any | null>(null);
  const [cartCount, setCartCount] = React.useState(0);
  const [wishlistCount, setWishlistCount] = React.useState(0);
  const [ordersCount, setOrdersCount] = React.useState(0);
  const [plans, setPlans] = React.useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<"profile" | "plans" | "wallet" | "vault" | "customOrders">(
    (location.state as any)?.activeSection || "profile"
  );
  const [vaultLoading, setVaultLoading] = React.useState(false);
  const [vaultError, setVaultError] = React.useState<string | null>(null);
  const [vaultSummary, setVaultSummary] = React.useState<GoldInvestmentsSummary["data"] | null>(null);
  const [customOrders, setCustomOrders] = React.useState<CustomOrder[]>([]);
  const [customOrdersLoading, setCustomOrdersLoading] = React.useState(false);
  const [walletLoading, setWalletLoading] = React.useState(false);
  const [walletBalance, setWalletBalance] = React.useState<string>("0");
  const [walletTxns, setWalletTxns] = React.useState<WalletTransaction[]>([]);

  const fetchProfile = async () => {
    if (!token) {
      window.location.href = "/signin";
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getUserProfile(token);
      setProfile(data);
    } catch (err: any) {
      if (err?.code === 'ETIMEDOUT' || err?.message?.includes('timeout')) {
        setError("Request timed out. Please check your internet connection and try again.");
      } else if (err?.response?.status === 401 || err?.response?.status === 403) {
        setError("Session expired or unauthorized. Please sign in again.");
        logout();
        setTimeout(() => {
          window.location.href = "/signin";
        }, 2000);
      } else {
        const serverMsg = err?.response?.data?.message;
        setError(serverMsg || err?.message || "Failed to load profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    if (!token) {
      console.log("No token available for fetchCounts");
      return;
    }

    try {
      // Fetch cart count
      const cartData = await getCartItems(token);
      if (cartData.success) {
        setCartCount(cartData.data.items?.length || 0);
      }

      // Fetch wishlist count
      const wishlistData = await getWishlistItems(token);
      if (wishlistData.success) {
        setWishlistCount(wishlistData.data.items?.length || 0);
      }
    } catch (err: any) {
      console.error("Error fetching cart/wishlist counts:", err);
    }

    // Fetch orders count separately to avoid outer catch interfering
    try {
      console.log("Fetching orders with token:", token ? "exists" : "missing");
      const ordersData = await getOrders(token);
      console.log("Full orders response:", ordersData);
      console.log("ordersData.success:", ordersData?.success);
      console.log("ordersData.data:", ordersData?.data);
      console.log("Is array?", Array.isArray(ordersData?.data));
      
      if (ordersData && ordersData.success && ordersData.data) {
        // Response structure: { success: true, data: [...] }
        const ordersArray = ordersData.data;
        const count = Array.isArray(ordersArray) ? ordersArray.length : 0;
        console.log("ordersArray:", ordersArray, "count:", count);
        console.log("About to set ordersCount to:", count);
        // Use functional update to ensure we don't overwrite a valid count
        setOrdersCount((prevCount) => {
          const newCount = count;
          console.log("setOrdersCount functional update - prevCount:", prevCount, "newCount:", newCount);
          return newCount;
        });
        console.log("Orders count set to:", count);
      } else {
        console.log("Orders response check failed - success:", ordersData?.success, "data exists:", !!ordersData?.data);
        // Only reset to 0 if we don't have a valid count
        setOrdersCount((prevCount) => {
          if (prevCount === 0) {
            console.log("Setting ordersCount to 0 (no valid data)");
            return 0;
          }
          console.log("Keeping previous ordersCount:", prevCount);
          return prevCount;
        });
      }
    } catch (orderErr: any) {
      console.error("Error fetching orders count:", orderErr);
      console.error("Error details:", orderErr?.response?.data || orderErr?.message);
      // Only reset to 0 if we don't have a valid count
      setOrdersCount((prevCount) => {
        if (prevCount === 0) {
          console.log("Setting ordersCount to 0 (error occurred)");
          return 0;
        }
        console.log("Keeping previous ordersCount after error:", prevCount);
        return prevCount;
      });
    }
  };

 

  React.useEffect(() => {
    if (token) {
      fetchProfile();
      fetchCounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only run when token changes

  React.useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        setLoadingPlans(true);
        const res = await getMyPlans(token);
        if (res.success) setPlans(res.data || []);
      } catch (e) {
        // noop
      } finally {
        setLoadingPlans(false);
      }
    })();
    (async () => {
      if (!token) return;
      try {
        setVaultLoading(true);
        setVaultError(null);
        const res = await getGoldInvestments(token);
        if (res.success) {
          setVaultSummary(res.data ?? null);
        } else {
          setVaultError(res.message || "Failed to load gold investments");
        }
      } catch (e: any) {
        setVaultError(e?.response?.data?.message || e?.message || "Failed to load gold investments");
      } finally {
        setVaultLoading(false);
      }
    })();
    (async () => {
      if (!token) return;
      try {
        setCustomOrdersLoading(true);
        const res = await getMyCustomOrders(token);
        if (res.status) {
          setCustomOrders(res.data || []);
        }
      } catch (e: any) {
        console.error("Error fetching custom orders:", e);
      } finally {
        setCustomOrdersLoading(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!token || !profile?.data?.id) return;
      if (activeSection !== "wallet") return;
      try {
        setWalletLoading(true);
        const res = await getUserWallet(token, Number(profile.data.id));
        if (res.success && res.data) {
          setWalletBalance(res.data.balance);
          setWalletTxns(res.data.transactions || []);
        } else if ((res as any).status && (res as any).data) {
          setWalletBalance((res as any).data.balance);
          setWalletTxns((res as any).data.transactions || []);
        } else {
          toast({ title: "Wallet", description: res.message || "Failed to fetch wallet" });
        }
      } catch (e: any) {
        toast({ title: "Wallet error", description: e?.response?.data?.message || e?.message || "Failed to fetch wallet", variant: "destructive" });
      } finally {
        setWalletLoading(false);
      }
    })();
  }, [activeSection, token, profile, toast]);

  const renderProfileSection = () => (
    <div className="space-y-4 lg:space-y-6 border p-4 lg:p-6">
      <h2 className="text-xl lg:text-2xl font-bold text-[#084526]">Profile Information</h2>
      {profile && (
        <div className="bg-white">
          <div className="mb-4 lg:mb-6">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-800 uppercase">
              {profile.data.name}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="text-xs lg:text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-sm lg:text-base text-gray-800 font-semibold break-words">
                  {profile?.data.name ?? "-"}
                </p>
              </div>

              <div>
                <label className="text-xs lg:text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-sm lg:text-base text-gray-800 font-semibold break-words">
                  {profile?.data.email ?? "-"}
                </p>
              </div>

              <div>
                <label className="text-xs lg:text-sm font-medium text-gray-500">Mobile Number</label>
                <p className="text-sm lg:text-base text-gray-800 font-semibold">
                  {profile?.data.mobile ?? "-"}
                </p>
              </div>

              <div>
                <label className="text-xs lg:text-sm font-medium text-gray-500">Account Status</label>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${profile?.data.status
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {profile?.data.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs lg:text-sm font-medium text-gray-500">Last Login</label>
                <p className="text-xs lg:text-sm text-gray-800 font-semibold">
                  {profile?.data.last_login_at ?? "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const openCashfreeForPayment = async (plan: any, payment: any) => {
    if (!token) return;
    try {
      const create = await createNextInstallmentOrder(token, Number(payment.id));
      if (!create?.success) throw new Error("Failed to create order");
      const activeOrder = (create as any)?.cashfree_order || (create as any)?.razorpay_order || {};
      const sessionId =
        extractCashfreeSessionId(activeOrder) ||
        extractCashfreeSessionId((create as any)?.data) ||
        extractCashfreeSessionId(create) ||
        (activeOrder as any)?.payment_session_id ||
        (create as any)?.payment_session_id;
      if (!sessionId) {
        toast({ title: "Payment error", description: "Missing Cashfree session. Please try again." });
        return;
      }

      const cashfree = await load({ mode: "sandbox" as any });
      await cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_self",
        returnUrl: `${window.location.origin}/payment-success?type=scheme&order_id=${encodeURIComponent(String((activeOrder as any)?.order_id || ""))}&scheme_payment_id=${encodeURIComponent(String(payment.id))}`,
        onSuccess: async (data: any) => {
          try {
            const cfPaymentId = data?.txnReference || data?.payment?.paymentId || data?.paymentId || data?.cf_payment_id || "";
            await verifySchemePaymentCashfree(token, {
              scheme_payment_id: Number(payment.id),
              order_id: String(activeOrder?.order_id || ""),
              razorpay_payment_id: String(cfPaymentId || ""),
            });
            toast({ title: "Payment verified", description: "Installment paid successfully" });
            const res = await getMyPlans(token);
            if (res.success) setPlans(res.data || []);
          } catch (err: any) {
            toast({ title: "Verification failed", description: err?.response?.data?.message || "Please contact support" });
          }
        },
        onFailure: (err: any) => {
          toast({ title: "Payment failed", description: err?.message || "Please try again" });
        },
      });
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
      toast({ title: "Payment init failed", description: serverMsg || err?.message || "Try again later" });
    }
  };

  const renderMyPlansTabular = () => (
    <div className="space-y-4 lg:space-y-6 border p-4 lg:p-6">
      <h2 className="text-xl lg:text-2xl font-bold text-[#084526]">My Plans</h2>
      <div className="bg-white">
        {loadingPlans ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 lg:h-10 lg:w-10 border-b-2 border-[#084526]"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-sm text-gray-600">No active plans found.</div>
        ) : (
          <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Scheme</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">End</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monthly</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Paid</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="bg-white border-b">
                <td className="px-3 py-2 whitespace-nowrap font-bold">{plan.scheme?.scheme}</td>
                <td className="px-3 py-2 whitespace-nowrap"><span className="inline-block rounded px-2 py-1 text-xs bg-gray-100 font-semibold">{plan.status}</span></td>
                <td className="px-3 py-2 whitespace-nowrap">{new Date(plan.start_date).toLocaleDateString()}</td>
                <td className="px-3 py-2 whitespace-nowrap">{new Date(plan.end_date).toLocaleDateString()}</td>
                <td className="px-3 py-2 whitespace-nowrap">₹{Number(plan.monthly_amount).toLocaleString("en-IN")}</td>
                <td className="px-3 py-2 whitespace-nowrap">₹{Number(plan.total_paid).toLocaleString("en-IN")}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/my-plans/${plan.id}/details`)}>View Details</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  </div>
);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderCustomOrders = () => (
    <div className="space-y-4 lg:space-y-6 border p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-bold text-[#084526]">Custom Orders</h2>
        <Button
          onClick={() => navigate("/custom-order")}
          className="bg-[#084526] hover:bg-[#0a5a2e] text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Create New
        </Button>
      </div>
      <div className="bg-white">
        {customOrdersLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 lg:h-10 lg:w-10 border-b-2 border-[#084526]"></div>
          </div>
        ) : customOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No custom orders yet</h3>
            <p className="text-gray-600 mb-6">Create your first custom jewelry piece</p>
            <Button
              onClick={() => navigate("/custom-order")}
              className="bg-[#084526] hover:bg-[#0a5a2e] text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Custom Order
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {customOrders.map((order) => {
              let designImages: string[] = [];
              try {
                if (order.design_image) {
                  const parsed = JSON.parse(order.design_image);
                  designImages = Array.isArray(parsed) ? parsed : [parsed];
                }
              } catch {
                designImages = order.design_image ? [order.design_image] : [];
              }

              return (
                <div key={order.id} className="border rounded-lg p-4 lg:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Design Images */}
                    {designImages.length > 0 && (
                      <div className="flex-shrink-0">
                        <div className="grid grid-cols-2 gap-2 w-32 lg:w-40">
                          {designImages.slice(0, 4).map((img, idx) => (
                            <div key={idx} className="aspect-square rounded-lg overflow-hidden border">
                              <img
                                src={getImageUrl(img)}
                                alt={`Design ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Order Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">
                            {order.category?.name || "Custom Order"} #{order.id}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {order.metal} {order.purity}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              Size: {order.size}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              Weight: {order.weight}g
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Description:</span>
                          <p className="text-sm text-gray-600 mt-1">{order.description}</p>
                        </div>
                        {order.note && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Special Instructions:</span>
                            <p className="text-sm text-gray-600 mt-1">{order.note}</p>
                          </div>
                        )}
                        {order.admin_note && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <span className="text-sm font-medium text-blue-700">Admin Note:</span>
                            <p className="text-sm text-blue-600 mt-1">{order.admin_note}</p>
                          </div>
                        )}
                        {order.price && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Price:</span>
                            <p className="text-lg font-bold text-[#084526]">₹{Number(order.price).toLocaleString("en-IN")}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center text-xs text-gray-500 pt-4 border-t">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Created: {new Date(order.created_at).toLocaleDateString()}</span>
                        {order.updated_at !== order.created_at && (
                          <span className="ml-4">
                            Updated: {new Date(order.updated_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderGoldVault = () => (
    <div className="space-y-4 lg:space-y-6 border p-4 lg:p-6">
      <h2 className="text-xl lg:text-2xl font-bold text-[#084526]">Gold Vault</h2>
      <div className="bg-white">
        {vaultLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 lg:h-10 lg:w-10 border-b-2 border-[#084526]"></div>
          </div>
        ) : vaultError ? (
          <div className="text-sm text-gray-600">{vaultError}</div>
        ) : !vaultSummary ? (
          <div className="text-sm text-gray-600">No data found.</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-amber-100 rounded p-4 shadow-lg  ">
                <div className="text-xs text-muted-foreground">Total Gold (g)</div>
                <div className="text-lg font-semibold">{Number(vaultSummary.total_gold_grams || 0).toFixed(4)} g</div>
              </div>
              <div className="bg-amber-100 rounded p-4 shadow-lg">
                <div className="text-xs text-muted-foreground">Total Invested</div>
                <div className="text-lg font-semibold">₹ {Number(vaultSummary.total_invested || 0).toLocaleString("en-IN")}</div>
              </div>
              <div className="bg-amber-100 rounded p-4 shadow-lg">
                <div className="text-xs text-muted-foreground">Current Rate</div>
                <div className="text-lg font-semibold">₹ {Number(vaultSummary.current_gold_rate || 0)}</div>
              </div>


              <div className="bg-amber-100 rounded p-4 shadow-lg">
                <div className="text-xs text-muted-foreground">Total value </div>
                <div className="text-lg font-semibold">{Number(vaultSummary.total_invested || 0).toLocaleString("en-IN")}</div>
              </div>
            </div>

          
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded">
                <thead className="bg-stone-200">
                  <tr>
                    {/* <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2">Date</th> */}
                    <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2">Plan ID</th>
                    {/* <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2">Invested</th> */}
                    <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2">Gold (g)</th>
                    <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2">Rate</th>
                    <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2">Paid Amount</th>
                    <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2">Order ID</th>
                    <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2">Payment ID</th>
                    <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2">Status</th>
                    <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2">Transaction Date & Time</th>
                  </tr>
                </thead>

                <tbody>
                  {(vaultSummary.plans || []).map((plan) => (
                    (plan.payments && plan.payments.length > 0
                      ? plan.payments.map((p) => (
                        <tr key={p.payment_id} className="border-t">
                          {/* <td className="px-3 py-2 text-sm">
                  {new Date(plan.created_at).toLocaleDateString()}
                </td> */}
                          <td className="px-3 py-2 text-sm font-medium">#{plan.plan_id}</td>
                          {/* <td className="px-3 py-2 text-sm">₹ {Number(plan.invested_amount).toLocaleString("en-IN")}</td> */}
                          <td className="px-3 py-2 text-sm">{plan.gold_grams} g</td>
                          <td className="px-3 py-2 text-sm">₹ {plan.gold_rate}</td>
                          <td className="px-3 py-2 text-sm">₹ {Number(p.amount).toLocaleString("en-IN")}</td>
                          <td className="px-3 py-2 text-sm">{p.order_id}</td>
                          <td className="px-3 py-2 text-sm">{p.payment_id}</td>
                          <td className="px-3 py-2 text-sm capitalize ">
                            <span className={`${p.status === 'success' ? 'bg-lime-900 ' : 'bg-red-400 '} rounded px-4 py-1 text-white`}>
                              {p.status}
                            </span>

                          </td>
                          <td className="px-3 py-2 text-sm">
                            {new Date(p.start_date).toLocaleDateString()} <br />
                            <span className="text-xs text-gray-500">
                              {new Date(p.start_date).toLocaleTimeString()}
                            </span>
                          </td>

                        </tr>
                      ))
                      : (
                        <tr key={plan.plan_id} className="border-t">
                          <td className="px-3 py-2 text-sm">
                            {new Date(plan.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 text-sm font-medium">#{plan.plan_id}</td>
                          <td className="px-3 py-2 text-sm">₹ {Number(plan.invested_amount).toLocaleString("en-IN")}</td>
                          <td className="px-3 py-2 text-sm">{plan.gold_grams} g</td>
                          <td className="px-3 py-2 text-sm">₹ {plan.gold_rate}</td>
                          <td className="px-3 py-2 text-sm text-gray-400" colSpan={4}>No payments</td>
                        </tr>
                      )
                    )
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
    </div>
  );

  // const renderWallet = () => (
  //   <div className="space-y-4 lg:space-y-6 border p-4 lg:p-6">
  //     <h2 className="text-xl lg:text-2xl font-bold text-[#084526]">Wallet</h2>
  //     <div className="bg-white">
  //       <div className="grid gap-4 lg:grid-cols-3">
  //         <Card className="lg:col-span-1">
  //           <CardHeader>
  //             <CardTitle className="flex items-center gap-2">
  //               <WalletIcon className="w-4 h-4 lg:w-5 lg:h-5" />
  //               Balance
  //             </CardTitle>
  //             <CardDescription>Maturity amounts from plans are credited here</CardDescription>
  //           </CardHeader>
  //           <CardContent>
  //             {walletLoading ? (
  //               <div className="py-6 flex justify-center">
  //                 <Loader2 className="h-6 w-6 animate-spin" />
  //               </div>
  //             ) : (
  //               <div className="text-3xl lg:text-4xl font-bold">₹{Number(walletBalance || 0).toLocaleString("en-IN")}</div>
  //             )}
  //           </CardContent>
  //         </Card>
  //         <Card className="lg:col-span-2">
  //           <CardHeader>
  //             <CardTitle>Transactions</CardTitle>
  //             <CardDescription>Credits and debits</CardDescription>
  //           </CardHeader>
  //           <CardContent>
  //             {walletLoading ? (
  //               <div className="flex justify-center py-12">
  //                 <Loader2 className="h-6 w-6 animate-spin" />
  //               </div>
  //             ) : walletTxns.length ? (
  //               <Table>
  //                 <TableHeader>
  //                   <TableRow>
  //                     <TableHead>Date</TableHead>
  //                     <TableHead>Type</TableHead>
  //                     <TableHead>Description</TableHead>
  //                     <TableHead>Amount</TableHead>
  //                     <TableHead>Actions</TableHead>  {/* Add this */}
  //                   </TableRow>
  //                 </TableHeader>
  //                 <TableBody>
  //                   {walletTxns.map((t) => (
  //                     <TableRow key={t.id}>
  //                       <TableCell>{new Date(t.created_at).toLocaleString()}</TableCell>
  //                       <TableCell>
  //                         <Badge className={t.type === "credit" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
  //                           {t.type === "credit" ? "Credit" : "Debit"}
  //                         </Badge>
  //                       </TableCell>
  //                       <TableCell className="max-w-[420px] truncate" title={t.description}>
  //                         {t.description}
  //                       </TableCell>
  //                       <TableCell className={t.type === "credit" ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
  //                         {t.type === "credit" ? "+" : "-"}₹{Number(t.amount).toLocaleString("en-IN")}
  //                       </TableCell>
  //                       <TableCell>
  //       {t.type === "credit" && t.user_scheme_id ? (
  //         <Button
  //           variant="outline"
  //           size="sm"
  //           onClick={() => navigate(`/my-plans/${t.user_scheme_id}/details`)}
  //         >
  //           View Scheme Details
  //         </Button>
  //       ) : (
  //         <span className="text-muted-foreground text-xs">—</span>
  //       )}
  //     </TableCell>
  //                     </TableRow>
  //                   ))}
  //                 </TableBody>
  //               </Table>
  //             ) : (
  //               <div className="text-sm text-gray-600 py-8 text-center">No transactions yet.</div>
  //             )}
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <ProfileLayout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
      profile={profile}
      wishlistCount={wishlistCount}
      ordersCount={ordersCount}
      customOrdersCount={customOrders.length}
    >
      {/* Only content area changes per section; all layout handled by ProfileLayout */}
      {loading && (
        <div className="flex justify-center items-center h-48 lg:h-64">
          <div className="animate-spin rounded-full h-10 w-10 lg:h-12 lg:w-12 border-b-2 border-[#084526]"></div>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-lg text-sm bg-red-100 text-red-700 border border-red-300">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchProfile}
              className="ml-4 px-4 py-2 bg-[#084526] text-white rounded hover:bg-[#0a5a2e] transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {profile && (
        <div className="flex-1 min-w-0">
          {activeSection === "profile" && renderProfileSection()}
          {activeSection === "plans" && <div className="mt-0">{renderMyPlansTabular()}</div>}
          {activeSection === "vault" && <div className="mt-0">{renderGoldVault()}</div>}
          {activeSection === "customOrders" && <div className="mt-0">{renderCustomOrders()}</div>}
        </div>
      )}
    </ProfileLayout>
  );
};

export default Profile;



