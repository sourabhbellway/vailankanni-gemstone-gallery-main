import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { useUserAuth } from "@/context/UserAuthContext";
import { getGoldInvestments, type GoldInvestmentsSummary } from "@/lib/api/userController";

const GoldInvestments: React.FC = () => {
  const { token } = useUserAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState<GoldInvestmentsSummary["data"] | null>(null);

  React.useEffect(() => {
    (async () => {
      if (!token) {
        window.location.href = "/signin";
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await getGoldInvestments(token);
        if (res.success) {
          setSummary(res.data ?? null);
        } else {
          setError(res.message || "Failed to load investments");
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || "Failed to load investments");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const prettyCurrency = (val: number) =>
    Number(val || 0)
      .toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
      .replace("₹", "₹ ");

  return (
    <>
      <Header />
      <div className="min-h-screen font-serif bg-gray-50">
        <div className="mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#084526]">Gold Vault</h1>
            <p className="text-sm text-muted-foreground">Your one-time custom gold purchases and history</p>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-48 lg:h-64">
              <div className="animate-spin rounded-full h-10 w-10 lg:h-12 lg:w-12 border-b-2 border-[#084526]"></div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg text-sm bg-red-100 text-red-700 border border-red-300">
              {error}
            </div>
          )}

          {summary && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Total Invested</div>
                    <div className="text-lg font-semibold">{prettyCurrency(summary.total_invested)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Total Gold (grams)</div>
                    <div className="text-lg font-semibold">{Number(summary.total_gold_grams || 0).toFixed(4)} g</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">Current Rate</div>
                    <div className="text-lg font-semibold">₹ {Number(summary.current_gold_rate || 0)}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-semibold mb-3">Purchase History</div>
                  <div className="space-y-3">
                    {(summary.plans || []).map((plan) => (
                      <div key={plan.plan_id} className="border rounded p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <div className="text-sm font-medium">Plan #{plan.plan_id}</div>
                            <div className="text-xs text-muted-foreground">{new Date(plan.created_at).toLocaleDateString()}</div>
                          </div>
                          <div className="text-sm">Gold: <span className="font-semibold">{plan.gold_grams} g</span></div>
                          <div className="text-sm">Rate: <span className="font-semibold">₹ {plan.gold_rate}</span></div>
                          <div className="text-sm">Invested: <span className="font-semibold">{prettyCurrency(plan.invested_amount)}</span></div>
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">Payments</div>
                        <div className="mt-1 space-y-2">
                          {(plan.payments || []).map((p) => (
                            <div key={p.payment_id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded p-2">
                              <div className="text-xs">Order: <span className="font-medium">{p.order_id}</span></div>
                              <div className="text-xs">Amount: <span className="font-medium">{prettyCurrency(p.amount)}</span></div>
                              <div className="text-xs">Status: <span className="font-medium capitalize">{p.status}</span></div>
                              <div className="text-xs">Date: <span className="font-medium">{new Date(p.start_date).toLocaleDateString()}</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GoldInvestments;


