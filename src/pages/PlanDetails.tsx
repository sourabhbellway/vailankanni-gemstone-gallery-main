import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DUMMY_GOLD_RATE = 4548;
const DUMMY_GOLD_RATE_PER_GRAM = 6000;
const DUMMY_GOLD_RATE_CHANGE = 0.5;
// No predefined plans here; this page is dedicated to custom plan only

const PlanDetails = () => {
  const [investment, setInvestment] = useState(100000);
  const goldYouGet = (investment / DUMMY_GOLD_RATE_PER_GRAM).toFixed(2);
  const navigate = useNavigate();

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
                className="border rounded px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={investment}
                min={1000}
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
                  >
                    {val
                      .toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      })
                      .replace("₹", "₹ ")}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
          <Card className="w-1/2">
            <CardContent className="p-6 flex flex-col gap-2 bg-gradient-to-br from-[#e7d18f] to-[#bfa14a] rounded-lg h-full">
              <div className="text-sm font-medium text-[#084526]">
                Live Gold Rate
              </div>
              <div className="text-lg font-bold text-[#084526]">
                ₹ {DUMMY_GOLD_RATE_PER_GRAM}/Gram
              </div>
              <div className="text-sm font-medium text-[#084526] mt-2">
                Your Investment
              </div>
              <div className="text-lg font-bold text-[#084526]">
                ₹ {investment.toLocaleString("en-IN")}
              </div>
              <div className="text-sm font-medium text-[#084526] mt-2">
                Gold You Will Get
              </div>
              <div className="text-3xl font-bold text-[#084526]">
                {goldYouGet} grams
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
            <Button
              className="bg-green-800 hover:bg-green-900 text-white px-8 py-3 rounded-lg text-lg font-semibold mb-2 w-full max-w-xs"
              onClick={() => navigate("/payments")}
            >
              Pay & Lock-In Rate
            </Button>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Rate Valid For Next 30 Minutes. No Hidden Charges
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default PlanDetails;
