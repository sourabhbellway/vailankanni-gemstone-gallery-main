import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUserProfile } from "@/lib/api/userController";
import { getCartItems } from "@/lib/api/cartController";
import { getWishlistItems } from "@/lib/api/wishlistController";
import { getOrders } from "@/lib/api/orderController";
import { useUserAuth } from "@/context/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Heart, User, Package, LogOut, Calendar, IndianRupee, Clock, CheckCircle2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMyPlans, createNextInstallmentOrder, verifySchemePaymentCashfree } from "@/lib/api/userSchemesController";
import { load } from "@cashfreepayments/cashfree-js";
import { extractCashfreeSessionId } from "@/lib/api/customGoldPlanController";
import { getGoldInvestments, type GoldInvestmentsSummary } from "@/lib/api/userController";
import logo from "@/assets/logo.jpg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const navigate = useNavigate();
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
  const [activeSection, setActiveSection] = React.useState<"profile" | "plans" | "vault">("profile");
  const [vaultLoading, setVaultLoading] = React.useState(false);
  const [vaultError, setVaultError] = React.useState<string | null>(null);
  const [vaultSummary, setVaultSummary] = React.useState<GoldInvestmentsSummary["data"] | null>(null);

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
    if (!token) return;

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

      // Fetch orders count
      const ordersData = await getOrders(token);
      if (ordersData.success) {
        setOrdersCount(ordersData.data?.length || 0);
      }
    } catch (err: any) {
      // Error fetching counts - silently fail
    }
  };

  React.useEffect(() => {
    fetchProfile();
    fetchCounts();
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
  }, []);

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

  const renderMyPlans = () => (
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
          <div className="space-y-6 lg:space-y-8">
            {plans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-3 lg:p-4">
                <div className="mb-4">
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800 break-words">{plan.scheme?.scheme}</h3>
                  <div className="text-xs lg:text-sm text-gray-600">Status: <span className="font-medium">{plan.status}</span></div>
                </div>

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details" className="text-xs lg:text-sm">Plan Details</TabsTrigger>
                    <TabsTrigger value="installments" className="text-xs lg:text-sm">Installments</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded p-3 lg:p-4">
                        <div className="flex items-center gap-2 mb-2 text-[#084526]">
                          <Calendar className="w-4 h-4" />
                          <span className="font-semibold text-sm lg:text-base">Overview</span>
                        </div>
                        <div className="text-xs lg:text-sm space-y-1">
                          <div>Timeline: {plan.scheme?.timeline?.replace("months", " Months")}</div>
                          <div>Monthly Amount: ₹{Number(plan.monthly_amount)}</div>
                          <div>Start: {new Date(plan.start_date).toLocaleDateString()}</div>
                          <div>End: {new Date(plan.end_date).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded p-3 lg:p-4">
                        <div className="flex items-center gap-2 mb-2 text-[#084526]">
                          <IndianRupee className="w-4 h-4" />
                          <span className="font-semibold text-sm lg:text-base">Payments</span>
                        </div>
                        <div className="text-xs lg:text-sm space-y-1">
                          <div>Total Paid: ₹{Number(plan.total_paid)}</div>
                          <div>Installments: {plan.payments?.length || 0}</div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded p-3 lg:p-4 lg:col-span-1">
                        <div className="flex items-center gap-2 mb-2 text-[#084526]">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold text-sm lg:text-base">Benefits</span>
                        </div>
                        <ul className="list-disc pl-4 text-xs lg:text-sm space-y-1">
                          {(plan.scheme?.points || []).map((p: string, idx: number) => (
                            <li key={idx} className="break-words">{p}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="installments" className="mt-4">
                    <div className="space-y-2">
                      {(plan.payments || []).map((payment: any) => (
                        <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded p-3 gap-3">
                          <div className="flex items-center gap-3">
                            {payment.status === 'paid' ? (
                              <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="text-xs lg:text-sm font-medium">Installment #{payment.installment_number}</div>
                              <div className="text-xs text-gray-600 break-words">Due: {new Date(payment.due_date).toLocaleDateString()} • Amount: ₹{Number(payment.amount)}</div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {payment.status === 'paid' ? (
                              <span className="text-xs lg:text-sm text-green-700 font-semibold">Paid</span>
                            ) : (
                              <Button size="sm" onClick={() => openCashfreeForPayment(plan, payment)} className="text-xs lg:text-sm">Pay Now</Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ))}
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

            {/* <div className="overflow-x-auto">
              <table className="min-w-full border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left text-sm font-semibold text-gray-700 px-3 py-2">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {(vaultSummary.plans || []).map((plan) => (
                    <tr key={plan.plan_id} className="border-t">
                      <td className="px-3 py-3 text-sm">
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium mr-4">{new Date(plan.created_at).toLocaleDateString()}</span>
                          <span className="text-muted-foreground">Plan:</span>
                          <span className="font-medium mr-4">#{plan.plan_id}</span>
                          <span className="text-muted-foreground">Invested:</span>
                          <span className="font-medium mr-4">₹ {Number(plan.invested_amount).toLocaleString("en-IN")}</span>
                          <span className="text-muted-foreground">Gold:</span>
                          <span className="font-medium mr-4">{plan.gold_grams} g</span>
                          <span className="text-muted-foreground">Rate:</span>
                          <span className="font-medium">₹ {plan.gold_rate}</span>
                        </div>
                        {(plan.payments || []).length > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            {(plan.payments || []).map((p) => (
                              <div key={p.payment_id} className="flex flex-wrap gap-x-4 gap-y-1">
                                <span>Order: <span className="font-medium">{p.order_id}</span></span>
                                <span>Amount: <span className="font-medium">₹ {Number(p.amount).toLocaleString("en-IN")}</span></span>
                                <span>Status: <span className="font-medium capitalize">{p.status}</span></span>
                                <span>Date: <span className="font-medium">{new Date(p.start_date).toLocaleDateString()}</span></span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> */}
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

  return (
    <>
      <Header />
      <div className="min-h-screen font-serif bg-gray-50">
        <div className="mx-auto px-4 lg:px-6 py-6 lg:py-10 ">

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
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
              {/* Left Sidebar */}
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="bg-white rounded-lg border p-4 lg:p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-base lg:text-lg font-semibold text-gray-800">
                      {profile.data.name}
                    </h2>
                    <p className="text-gray-500 text-xs lg:text-sm">
                      {profile?.data.user_code}
                    </p>
                  </div>

                  <nav className="space-y-2">
                    <button
                      onClick={() => setActiveSection("profile")}
                      className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors text-sm lg:text-base ${activeSection === 'profile' ? 'bg-[#084526] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <User className="w-4 h-4 lg:w-5 lg:h-5" />
                      <span>View Profile</span>
                    </button>

                    <button
                      onClick={() => setActiveSection("plans")}
                      className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors text-sm lg:text-base ${activeSection === 'plans' ? 'bg-[#084526] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <Layers className="w-4 h-4 lg:w-5 lg:h-5" />
                      <span>My Plans</span>
                    </button>

                    <button
                      onClick={() => setActiveSection("vault")}
                      className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors text-sm lg:text-base ${activeSection === 'vault' ? 'bg-[#084526] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 10.5L12 6L20 10.5V18C20 18.8284 19.3284 19.5 18.5 19.5H5.5C4.67157 19.5 4 18.8284 4 18V10.5Z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M9 19.5V13.5H15V19.5" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      <span>Gold Vault</span>
                    </button>

                    <button
                      onClick={() => navigate("/wishlist")}
                      className="w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100 text-sm lg:text-base"
                    >
                      <Heart className="w-4 h-4 lg:w-5 lg:h-5" />
                      <span>Wishlist ({wishlistCount})</span>
                    </button>

                    <button
                      onClick={() => navigate("/orders")}
                      className="w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100 text-sm lg:text-base"
                    >
                      <Package className="w-4 h-4 lg:w-5 lg:h-5" />
                      <span>Orders ({ordersCount})</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        window.location.href = "/signin";
                      }}
                      className="w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50 text-sm lg:text-base"
                    >
                      <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
                      <span>Logout</span>
                    </button>
                  </nav>
                </div>
              </div>

              {/* Right Content Area */}
              <div className="flex-1 min-w-0">
                {activeSection === "profile" && renderProfileSection()}
                {activeSection === "plans" && <div className="mt-0">{renderMyPlans()}</div>}
                {activeSection === "vault" && <div className="mt-0">{renderGoldVault()}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;



