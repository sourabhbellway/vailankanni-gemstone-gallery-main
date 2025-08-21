import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PAYMENT_METHODS = [
  {
    label: "UPI",
    description: "Google pay, phone pay, paytm",
    icon: "🟡",
  },
  {
    label: "Credit/Debit Card",
    description: "Visa, Mastercard, RuPay",
    icon: "💳",
  },
  {
    label: "NetBanking",
    description: "Visa, Mastercard, RuPay",
    icon: "🏦",
  },
  {
    label: "Wallets",
    description: "Paytm, Amazon Pay, Mobikwik",
    icon: "👛",
  },
];

const DUMMY_ORDER = {
  goldAmount: "2.5g",
  ratePerGram: 4548,
  gst: 483,
  total: 4548,
  autoDebit: false,
};

const Payments = () => {
  const [selected, setSelected] = useState(0);
  const [autoDebit, setAutoDebit] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc]">
      <Header />
      <div className="w-auto bg-[#f3e3b2] rounded-xl mt-8 mx-10 flex items-center px-8 py-4 shadow-md">
        <span className="mr-2">⚠️</span>
        <span className="text-[#7a5a1e] font-medium">
          You're Just Step Away From Locking Your Gold At Today's Rate
        </span>
      </div>
      <div className="flex flex-col md:flex-row gap-8 mx-10 mt-8">
        {/* Payment Methods */}
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {PAYMENT_METHODS.map((method, idx) => (
                <div
                  key={method.label}
                  className={`flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer transition-all ${
                    selected === idx
                      ? "border-green-600 bg-[#f5fbe9]"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() => setSelected(idx)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <div className="font-semibold">{method.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {method.description}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selected === idx ? "border-green-600" : "border-gray-300"
                    }`}
                  >
                    {selected === idx ? (
                      <span className="w-3 h-3 bg-green-600 rounded-full inline-block"></span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Order Summary */}
        <Card className="w-full md:w-96">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="text-green-900 font-semibold text-md mb-2">
              Order History
            </div>
            <div className="flex justify-between text-sm">
              <span>Gold Amount</span>
              <span className="text-green-700">{DUMMY_ORDER.goldAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Rate Per Gram</span>
              <span>₹ {DUMMY_ORDER.ratePerGram}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>GST (5%)</span>
              <span>₹ {DUMMY_ORDER.gst}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount</span>
              <span className="text-orange-700">₹ {DUMMY_ORDER.total}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium">Auto Debit</span>
              <button
                className={`w-10 h-6 rounded-full border-2 flex items-center transition-colors duration-200 ${
                  autoDebit
                    ? "bg-yellow-600 border-yellow-600"
                    : "bg-gray-200 border-gray-300"
                }`}
                onClick={() => setAutoDebit(!autoDebit)}
                type="button"
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
                    autoDebit ? "translate-x-4" : ""
                  }`}
                ></span>
              </button>
            </div>
            <Button className="bg-green-800 hover:bg-green-900 text-white px-8 py-3 rounded-lg text-lg font-semibold w-full mt-4" onClick={() => navigate("/signin")}>
              Proceed To Payment
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Payments;
