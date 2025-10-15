import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "@/context/UserAuthContext";
import { createGoldPlan, extractCashfreeSessionId, initiateGoldPlanPayment, previewGoldPlan, verifyGoldPlanPayment } from "@/lib/api/customGoldPlanController";
import { load } from "@cashfreepayments/cashfree-js";

const DUMMY_GOLD_RATE = 4548;
const DUMMY_GOLD_RATE_PER_GRAM = 6000;
const DUMMY_GOLD_RATE_CHANGE = 0.5;
const MAX_INVESTMENT_AMOUNT = 100000; // Maximum amount allowed by Cashfree
// No predefined plans here; this page is dedicated to custom plan only

const PlanDetails = () => {
  const { token } = useUserAuth();
  const [investment, setInvestment] = useState(50000);
  const [creating, setCreating] = useState(false);
  const [createdPlanId, setCreatedPlanId] = useState<number | null>(null);
  const [serverGoldRate, setServerGoldRate] = useState<number | null>(null);
  const [serverGoldGrams, setServerGoldGrams] = useState<number | null>(null);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const goldYouGet = useMemo(() => (investment / DUMMY_GOLD_RATE_PER_GRAM).toFixed(4), [investment]);
  const navigate = useNavigate();
  
  const isInvestmentExceeded = investment > MAX_INVESTMENT_AMOUNT;

  const prettyCurrency = (val: number) =>
    val
      .toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
      .replace("₹", "₹ ");

  async function handleCreatePlanAndPay() {
    if (!token) {
      navigate("/signin");
      return;
    }
    
    if (isInvestmentExceeded) {
      setError(`Investment amount cannot exceed ₹${MAX_INVESTMENT_AMOUNT.toLocaleString()}. Please reduce your investment amount.`);
      return;
    }
    
    setError(null);
    setCreating(true);
    try {
      // Preview (optional) to show server calc
      try {
        const preview = await previewGoldPlan(token, investment);
        setServerGoldRate(preview?.data?.gold_rate ?? null);
        setServerGoldGrams(preview?.data?.gold_grams ?? null);
      } catch {
        // ignore preview errors, proceed
      }

      const created = await createGoldPlan(token, investment);
      const planId = created?.data?.plan;
      setCreatedPlanId(planId ?? null);
      setServerGoldRate(created?.data?.gold_rate ?? null);
      setServerGoldGrams(created?.data?.gold_grams ?? null);

      const paymentInit = await initiateGoldPlanPayment(planId, token);
      
      // Check if payment creation failed
      if (paymentInit?.success === false || paymentInit?.payment?.code) {
        const errorMessage = paymentInit?.payment?.message || paymentInit?.message || "Payment initialization failed";
        if (errorMessage.includes("order amount cannot be greater than the max order amount")) {
          throw new Error("Payment amount exceeds the maximum limit. Please reduce your investment amount and try again.");
        }
        throw new Error(errorMessage);
      }
      
      const initOrderId = (paymentInit as any)?.order_id ?? null;
      setPaymentOrderId(initOrderId);
      try {
        if (initOrderId) localStorage.setItem("va_last_cashfree_order_id", String(initOrderId));
      } catch {}
      const sessionId = extractCashfreeSessionId(paymentInit) || extractCashfreeSessionId(paymentInit?.data);
      if (!sessionId) {
        const availableKeys = Object.keys(paymentInit || {}).join(", ");
        throw new Error(`Unable to get Cashfree session. Available keys: ${availableKeys}`);
      }

      const cashfree = await load({ mode: "sandbox" });
      await cashfree.checkout({ 
        paymentSessionId: sessionId, 
        redirectTarget: "_self",
        returnUrl: `${window.location.origin}/payment-success?order_id=${initOrderId}`,
        onSuccess: async (data: any) => {
          // Automatically verify payment
          try {
            const verificationResult = await verifyGoldPlanPayment(token, initOrderId);
            if (verificationResult?.success) {
              // Navigate to success page
              navigate(`/payment-success?order_id=${initOrderId}&verified=true`);
            } else {
              navigate(`/payment-success?order_id=${initOrderId}&verified=false`);
            }
          } catch (error) {
            navigate(`/payment-success?order_id=${initOrderId}&verified=false`);
          }
        },
        onFailure: (data: any) => {
          navigate(`/payment-success?order_id=${initOrderId}&verified=false&error=payment_failed`);
        }
      });
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc]">
      <Header />
      {/* Gold Rate Banner */}
      <div className="w-auto bg-gradient-to-r from-[#e7d18f] to-[#bfa14a] rounded-xl mt-8 mx-10  flex items-center justify-between px-8 py-4 shadow-md">
        <div>
          <div className="text-lg font-medium text-[#084526]">
            Live Gold Rate
          </div>
          <div className="text-3xl font-bold text-[#084526] flex items-center gap-2">
            <span>₹ {DUMMY_GOLD_RATE}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-[#084526]">24k Gold</div>
          <div className="text-green-700 text-xs font-semibold">
            ↑ +{DUMMY_GOLD_RATE_CHANGE}%
          </div>
        </div>
      </div>

      {/* Custom Plan only: No static plan cards */}

      {/* Investment Calculator */}
      <div className="mx-0 mt-8 w-full  md:px-10 flex flex-col md:flex-row gap-6 items-stretch">
        <Card className="w-full flex items-center justify-between py-6 pr-6">
          <CardContent className="p-6">
            <div className="font-semibold mb-4">
              Calculate Your Gold Investment
            </div>
            <div className="mb-2 text-sm">Investment Amount</div>
            <div className="flex flex-col gap-4 mb-4">
              <input
                type="number"
                className={`border rounded px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 ${
                  isInvestmentExceeded ? 'border-red-500 focus:ring-red-400' : 'focus:ring-yellow-400'
                }`}
                value={investment}
                min={1000}
                max={MAX_INVESTMENT_AMOUNT}
                step={1000}
                onChange={(e) => setInvestment(Number(e.target.value))}
              />
              <div className="flex gap-1">
                {[10000, 25000, 50000, 100000].map((val) => (
                  <Button
                    key={val}
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setInvestment(val)}
                    disabled={val > MAX_INVESTMENT_AMOUNT}
                  >
                    {prettyCurrency(val)}
                  </Button>
                ))}
              </div>
              {isInvestmentExceeded && (
                <div className="text-red-600 text-sm mt-2">
                  ⚠️ Investment amount exceeds the maximum limit of ₹{MAX_INVESTMENT_AMOUNT.toLocaleString()}
                </div>
              )}
            </div>
          </CardContent>
          <Card className="w-1/2">
            <CardContent className="p-6 flex flex-col gap-2 bg-gradient-to-br from-[#e7d18f] to-[#bfa14a] rounded-lg h-full">
              <div className="text-sm font-medium text-[#084526]">
                Live Gold Rate
              </div>
              <div className="text-lg font-bold text-[#084526]">
                ₹ {(serverGoldRate ?? DUMMY_GOLD_RATE_PER_GRAM)}/Gram
              </div>
              <div className="text-sm font-medium text-[#084526] mt-2">
                Your Investment
              </div>
              <div className="text-lg font-bold text-[#084526]">
                {prettyCurrency(investment)}
              </div>
              <div className="text-sm font-medium text-[#084526] mt-2">
                Gold You Will Get
              </div>
              <div className="text-3xl font-bold text-[#084526]">
                {(serverGoldGrams ?? Number(goldYouGet)).toString()} grams
              </div>
            </CardContent>
          </Card>
        </Card>
      </div>

      {/* Call to Action Section */}
      <div className="w-auto mx-10 mt-10 mb-16">
        <Card>
          <CardContent className="p-8 flex flex-col items-center">
            <div className="text-xl font-semibold mb-2 text-center">
              Ready To Start Your Gold Journey?
            </div>
            <div className="text-sm text-muted-foreground mb-6 text-center">
              Lock In Today's Rate And Begin Building Your Gold Portfolio
            </div>
            {error && (
              <div className="text-red-600 text-sm mb-3">{error}</div>
            )}
            <Button
              className="bg-green-800 hover:bg-green-900 text-white px-8 py-3 rounded-lg text-lg font-semibold mb-2 w-full max-w-xs disabled:opacity-60"
              onClick={handleCreatePlanAndPay}
              disabled={creating || isInvestmentExceeded}
            >
              {creating ? "Processing..." : isInvestmentExceeded ? "Amount Exceeds Limit" : "Pay & Lock-In Rate"}
            </Button>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Rate Valid For Next 30 Minutes. No Hidden Charges
              <br />
              Maximum investment: ₹{MAX_INVESTMENT_AMOUNT.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default PlanDetails;
