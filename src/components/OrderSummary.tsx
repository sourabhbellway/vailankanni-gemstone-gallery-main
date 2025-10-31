import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface OrderSummaryProps {
  cartItems: any[];
  totalAmount: number;
  couponDiscount?: number;
  finalAmount: number;
  appliedCoupon?: any;
  onCheckout?: () => void;
  onContinue?: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  totalAmount,
  couponDiscount = 0,
  finalAmount,
  appliedCoupon,
  onCheckout,
  onContinue,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border sticky top-8">
      <h3 className="text-2xl font-bold text-[#084526] mb-6">Order Summary</h3>

      {/* Items List */}
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div
            key={`${item.id}-${item.size ?? ""}-${item.color ?? ""}`}
            className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg"
          >
            <img
              src={item.product?.image || "/placeholder.png"}
              alt={item.product?.name || ""}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{item.product?.name}</p>
              {(item.size || item.color) && (
                <p className="text-xs text-gray-500">
                  {item.size && <>Size: {item.size}</>}
                  {item.size && item.color && " • "}
                  {item.color && <>Color: {item.color}</>}
                </p>
              )}
              <p className="text-xs text-amber-600">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-bold text-[#084526]">
              ₹{(Number(item.unit_price || 0) * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-lg text-green-600">
              <span>Coupon Discount</span>
              <span>-₹{couponDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Shipping</span>
            <span className="font-semibold text-green-600">FREE</span>
          </div>

          <div className="border-t pt-2">
            <div className="flex justify-between text-2xl font-bold text-[#084526]">
              <span>Total</span>
              <span>₹{finalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Free shipping banner */}
      <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
        <Sparkles className="w-4 h-4" />
        <span>Free shipping on all orders</span>
      </div>

      {/* Buttons (optional) */}
      {onCheckout && (
        <Button
          onClick={onCheckout}
          className="w-full bg-[#084526] hover:bg-[#0a5a2e] text-white py-3 text-lg font-semibold rounded-xl shadow-md"
        >
          Proceed to Checkout
        </Button>
      )}
      {onContinue && (
        <Button
          variant="outline"
          onClick={onContinue}
          className="w-full mt-3 border-[#084526] text-[#084526] hover:bg-[#084526] hover:text-white"
        >
          Continue Shopping
        </Button>
      )}
    </div>
  );
};

export default OrderSummary;
