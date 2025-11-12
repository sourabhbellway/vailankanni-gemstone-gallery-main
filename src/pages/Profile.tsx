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
import { Heart, User, Package, LogOut, Calendar, IndianRupee, Clock, CheckCircle2, Layers, Sparkles, Wallet as WalletIcon, Loader2 } from "lucide-react";
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
  const [activeSection, setActiveSection] = React.useState<"profile" | "plans" | "wallet" | "vault" | "customOrders" | "orders" | "wishlist">(
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200'; // Soft warm yellow
      case 'processing':
        return 'bg-sky-50 text-sky-700 border border-sky-200'; // Calm blue tone
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200'; // Fresh mint green
      case 'completed':
        return 'bg-green-50 text-green-700 border border-green-200'; // Success green
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-200'; // Elegant red/pink tone
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200'; // Neutral gray
    }
  };

  const renderProfileSection = () => (
    <div className="space-y-6 border p-6 rounded-2xl bg-gray-50 shadow-sm">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <h2 className="text-2xl font-bold text-[#084526] tracking-tight">Profile Information</h2>
        <p className="text-sm text-gray-600">View your account details and current status</p>
      </div>

      {profile && (
        <div className="bg-white rounded-2xl shadow-md p-6 transition-all hover:shadow-lg">
          {/* Name / Top Section */}
          <div className="mb-6 border-b pb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {profile?.data.name || "User Name"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Member since {new Date(profile?.data.created_at).toLocaleDateString() || "-"}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-base text-gray-900 font-semibold mt-1">
                {profile?.data.name ?? "-"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Email Address</label>
              <p className="text-base text-gray-900 font-semibold mt-1 break-words">
                {profile?.data.email ?? "-"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Mobile Number</label>
              <p className="text-base text-gray-900 font-semibold mt-1">
                {profile?.data.mobile ?? "-"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Account Status</label>
              <div className="mt-1">
                <Badge
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${profile?.data.status
                      ? "bg-green-200/70 text-green-700 hover:bg-emerald-200"
                      : "bg-red-200/70 text-red-700 hover:bg-red-200"
                    }`}
                >
                  {profile?.data.status ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-500">Last Login</label>
              <p className="text-sm text-gray-900 font-semibold mt-1">
                {profile?.data.last_login_at ?? "-"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // const openCashfreeForPayment = async (plan: any, payment: any) => {
  //   if (!token) return;
  //   try {
  //     const create = await createNextInstallmentOrder(token, Number(payment.id));
  //     if (!create?.success) throw new Error("Failed to create order");
  //     const activeOrder = (create as any)?.cashfree_order || (create as any)?.razorpay_order || {};
  //     const sessionId =
  //       extractCashfreeSessionId(activeOrder) ||
  //       extractCashfreeSessionId((create as any)?.data) ||
  //       extractCashfreeSessionId(create) ||
  //       (activeOrder as any)?.payment_session_id ||
  //       (create as any)?.payment_session_id;
  //     if (!sessionId) {
  //       toast({ title: "Payment error", description: "Missing Cashfree session. Please try again." });
  //       return;
  //     }

  //     const cashfree = await load({ mode: "sandbox" as any });
  //     await cashfree.checkout({
  //       paymentSessionId: sessionId,
  //       redirectTarget: "_self",
  //       returnUrl: `${window.location.origin}/payment-success?type=scheme&order_id=${encodeURIComponent(String((activeOrder as any)?.order_id || ""))}&scheme_payment_id=${encodeURIComponent(String(payment.id))}`,
  //       onSuccess: async (data: any) => {
  //         try {
  //           const cfPaymentId = data?.txnReference || data?.payment?.paymentId || data?.paymentId || data?.cf_payment_id || "";
  //           await verifySchemePaymentCashfree(token, {
  //             scheme_payment_id: Number(payment.id),
  //             order_id: String(activeOrder?.order_id || ""),
  //             razorpay_payment_id: String(cfPaymentId || ""),
  //           });
  //           toast({ title: "Payment verified", description: "Installment paid successfully" });
  //           const res = await getMyPlans(token);
  //           if (res.success) setPlans(res.data || []);
  //         } catch (err: any) {
  //           toast({ title: "Verification failed", description: err?.response?.data?.message || "Please contact support" });
  //         }
  //       },
  //       onFailure: (err: any) => {
  //         toast({ title: "Payment failed", description: err?.message || "Please try again" });
  //       },
  //     });
  //   } catch (err: any) {
  //     const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
  //     toast({ title: "Payment init failed", description: serverMsg || err?.message || "Try again later" });
  //   }
  // };

  const renderMyPlansTabular = () => (
    <div className="space-y-6 border p-6 rounded-2xl bg-gray-50 shadow-sm">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <h2 className="text-2xl font-bold text-[#084526] tracking-tight">My Plans</h2>
        <p className="text-sm text-gray-600">Overview of your active investment plans</p>
      </div>

      {/* Table / Loader / Empty State */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {loadingPlans ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#084526]"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No active plans found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">Scheme</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">Start</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">End</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">Monthly</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">Total Paid</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {plan.scheme?.scheme}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
  <Badge
    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 cursor-default
      ${plan.status === "active"
        ? "bg-emerald-200/70 text-emerald-900 border-emerald-200 hover:bg-emerald-200"
        : plan.status === "pending"
          ? "bg-amber-200/70 text-amber-900 border-amber-200 hover:bg-amber-200"
          : plan.status === "disbursed"
            ? "bg-sky-200/70 text-sky-900 border-sky-200 hover:bg-sky-200"
            : plan.status === "cancelled"
              ? "bg-rose-200/70 text-rose-900 border-rose-200 hover:bg-rose-200"
              : "bg-slate-200/70 text-slate-900 border-slate-200 hover:bg-slate-200"
      }`}
  >
    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
  </Badge>
</td>



                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {new Date(plan.start_date).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {new Date(plan.end_date).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-800">
                      ₹{Number(plan.monthly_amount).toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-800">
                      ₹{Number(plan.total_paid).toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap ">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[#084526] border-[#084526] hover:bg-[#084526] hover:text-white transition-colors"
                        onClick={() => navigate(`/my-plans/${plan.id}/details`)}
                      >
                        View Details
                      </Button>
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

  const renderGoldVault = () => (
    <div className="space-y-6 border rounded-2xl p-4 lg:p-6 bg-gray-50/50">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-[#084526] flex items-center gap-2">
          🪙 Gold Vault
        </h2>
        <span className="text-sm text-gray-500">
          Your digital gold summary & transactions
        </span>
      </div>

      {vaultLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#084526] border-t-transparent"></div>
        </div>
      ) : vaultError ? (
        <div className="text-sm text-gray-600">{vaultError}</div>
      ) : !vaultSummary ? (
        <div className="text-sm text-gray-600">No data found.</div>
      ) : (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="relative bg-gradient-to-br from-yellow-50 to-amber-100 p-5 rounded-2xl shadow-md border border-amber-200">
              <div className="text-xs uppercase text-gray-500 tracking-wide">Total Gold (g)</div>
              <div className="mt-2 text-2xl font-bold text-gray-800">
                {Number(vaultSummary.total_gold_grams || 0).toFixed(4)} g
              </div>
              <div className="absolute top-2 right-3 text-yellow-400">🏆</div>
            </div>

            <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-2xl shadow-md border border-emerald-200">
              <div className="text-xs uppercase text-gray-500 tracking-wide">Total Invested</div>
              <div className="mt-2 text-2xl font-bold text-gray-800">
                ₹ {Number(vaultSummary.total_invested || 0).toLocaleString("en-IN")}
              </div>
              <div className="absolute top-2 right-3 text-emerald-500">💰</div>
            </div>

            <div className="relative bg-gradient-to-br from-sky-50 to-blue-100 p-5 rounded-2xl shadow-md border border-blue-200">
              <div className="text-xs uppercase text-gray-500 tracking-wide">Current Rate</div>
              <div className="mt-2 text-2xl font-bold text-gray-800">
                ₹ {Number(vaultSummary.current_gold_rate || 0)}
              </div>
              <div className="absolute top-2 right-3 text-sky-500">📈</div>
            </div>

            <div className="relative bg-gradient-to-br from-amber-50 to-yellow-100 p-5 rounded-2xl shadow-md border border-yellow-200">
              <div className="text-xs uppercase text-gray-500 tracking-wide">Total Value</div>
              <div className="mt-2 text-2xl font-bold text-gray-800">
                ₹ {Number(vaultSummary.total_invested || 0).toLocaleString("en-IN")}
              </div>
              <div className="absolute top-2 right-3 text-yellow-500">🏅</div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Gold Transactions</h3>
                <p className="text-sm text-gray-500">
                  Overview of all plan payments and gold accumulation
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {vaultSummary?.plans?.length || 0} Plans
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Plan ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Gold (g)</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rate</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Paid Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Payment ID</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Transaction Date & Time</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {(vaultSummary.plans || []).map((plan) =>
                    plan.payments && plan.payments.length > 0 ? (
                      plan.payments.map((p) => (
                        <tr key={p.payment_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-[#084526]">#{plan.plan_id}</td>
                          <td className="px-4 py-3">{plan.gold_grams} g</td>
                          <td className="px-4 py-3">₹ {plan.gold_rate}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-700">
                            ₹ {Number(p.amount).toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3 text-gray-700">{p.order_id}</td>
                          <td className="px-4 py-3 text-gray-700">{p.payment_id}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border
                                ${p.status === "success"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${p.status === "success" ? "bg-emerald-500" : "bg-rose-500"}`}
                              ></span>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {new Date(p.start_date).toLocaleDateString()}
                            <div className="text-xs text-gray-500">
                              {new Date(p.start_date).toLocaleTimeString()}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr key={plan.plan_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-[#084526]">#{plan.plan_id}</td>
                        <td className="px-4 py-3">{plan.gold_grams} g</td>
                        <td className="px-4 py-3">₹ {plan.gold_rate}</td>
                        <td className="px-4 py-3 text-gray-400" colSpan={4}>
                          No payments
                        </td>
                        <td className="px-4 py-3">
                          {new Date(plan.created_at).toLocaleDateString()}
                          <div className="text-xs text-gray-500">
                            {new Date(plan.created_at).toLocaleTimeString()}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

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



