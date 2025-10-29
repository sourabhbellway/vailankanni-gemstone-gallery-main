import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCartItems, updateCartQuantity, removeFromCart, applyCoupon, getCouponsList } from "@/lib/api/cartController";
import { useUserAuth } from "@/context/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getImageUrl } from "@/config";

const Cart = () => {
  const navigate = useNavigate();
  const { token } = useUserAuth();
  const { toast } = useToast();

  const [cartItems, setCartItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState<number | null>(null);
  const [cartSummary, setCartSummary] = React.useState<{ total_amount: number; final_amount: number; cart_id?: number }>({
    total_amount: 0,
    final_amount: 0,
  });

  const [formData, setFormData] = React.useState({ coupon_code: "" });
  const [appliedCoupon, setAppliedCoupon] = React.useState<any>(null);
  const [couponDiscount, setCouponDiscount] = React.useState(0);
  const [showCoupon, setShowCoupon] = React.useState(false);
  const [coupons, setCoupons] = React.useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = React.useState(false);

  // Fetch cart items
  const fetchCartItems = async () => {
    if (!token) {
      navigate("/signin");
      return;
    }
    setLoading(true);
    try {
      const data = await getCartItems(token);
      if (data.success) {
        setCartItems(data.data.items || []);
        setCartSummary({
          total_amount: data.data.total_amount ?? 0,
          final_amount: data.data.final_amount ?? 0,
          cart_id: data.data.cart_id,
        });
      } else {
        setCartItems([]);
        setCartSummary({ total_amount: 0, final_amount: 0 });
      }
    } catch (err: any) {
      console.error("Cart fetch error:", err);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
      setCartItems([]);
      setCartSummary({ total_amount: 0, final_amount: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Fetch available coupons
  const fetchCoupons = async () => {
    setCouponsLoading(true);
    try {
      const data = await getCouponsList();
      if (data.status) setCoupons(data.data || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive",
      });
    } finally {
      setCouponsLoading(false);
    }
  };

  // Quantity update
  const handleQuantityUpdate = async (cartItemId: number, newQuantity: number) => {
    if (!token) return;
    setUpdating(cartItemId);
    try {
      const data = await updateCartQuantity({ item_id: cartItemId, quantity: newQuantity }, token);
      if (data.success) {
        toast({ title: "Success", description: "Quantity updated successfully" });
        fetchCartItems();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to update quantity", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  // Remove item from cart
  const handleRemoveFromCart = async (cartItemId: number) => {
    if (!token) return;
    try {
      const data = await removeFromCart({ item_id: cartItemId }, token);
      if (data.success) {
        toast({ title: "Success", description: "Item removed from cart" });
        fetchCartItems();
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to remove item from cart", variant: "destructive" });
    }
  };

  // Input change handler
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCouponToggle = () => {
    setShowCoupon(prev => !prev);
    if (!showCoupon) fetchCoupons();
  };

  // Apply coupon
  const handleApplyCoupon = async (couponCode: string) => {
    if (!token || !cartSummary.cart_id) return;
    try {
      const data = await applyCoupon(cartSummary.cart_id, couponCode, token);
      if (data.status) {
        setAppliedCoupon({ code: couponCode, value: data.data.discount_amount ?? 0 });
        setCouponDiscount(data.data.discount_amount ?? 0);
        // Fetch updated cart totals from server
        await fetchCartItems();
        toast({ title: "Success", description: data.message || "Coupon applied successfully!" });
      } else {
        toast({ title: "Error", description: data.message || "Failed to apply coupon", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to apply coupon", variant: "destructive" });
    }
  };
  

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setFormData(prev => ({ ...prev, coupon_code: "" }));
    fetchCartItems();
  };

  React.useEffect(() => {
    fetchCartItems();
  }, []);

  const getProductImages = (product: any) => {
    try {
      const imageData = JSON.parse(product.image || "[]");
      if (Array.isArray(imageData) && imageData.length > 0) return getImageUrl(imageData[0]);
    } catch (err) {
      console.error(err);
    }
    return "/placeholder.svg";
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen font-serif flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#084526]"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen font-serif ">
        <div className="mx-auto px-4 py-10 ">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-[#084526] hover:text-[#0a5a2e]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#084526] rounded-full">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#084526]">Shopping Cart</h1>
                <p className="text-gray-600">Your precious jewelry collection</p>
              </div>
            </div>
          </div>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-xl p-6 border">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <img src={getProductImages(item.product)} alt={item.product.name} className="w-32 h-32 object-cover rounded-xl shadow-lg" />
                        <div className="absolute -top-2 -right-2 bg-[#084526] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {item.quantity}
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{item.product.name}</h3>
                        <div className="space-y-1 mb-4 text-sm">
                          <p className="text-amber-600 font-medium flex items-center gap-1">
                            <Sparkles className="w-4 h-4" /> Purity: {item.product.purity}
                          </p>
                          <p className="text-gray-600">Metal: {item.product.metal_type}</p>
                          <p className="text-gray-600">Weight: {item.product.weight}g</p>
                          <p className="text-gray-600">Size: {item.size || "—"}</p>
                          <p className="text-gray-600">Making Charges: ₹{item.product.making_charges}</p>
                        </div>
                        <div className="mt-2">
                          <p className="text-2xl font-bold text-[#084526]">₹{item.unit_price}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} × ₹{item.unit_price} = ₹{item.total_price}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center space-y-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => item.quantity > 1 && handleQuantityUpdate(item.id, item.quantity - 1)} disabled={updating === item.id || item.quantity <= 1} className="w-8 h-8 p-0">
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input type="number" min={1} max={item.product.stock} value={item.quantity} onChange={(e) => {
                            const newQty = parseInt(e.target.value);
                            if (newQty >= 1 && newQty <= item.product.stock) handleQuantityUpdate(item.id, newQty);
                          }} disabled={updating === item.id || item.product.stock === 0} />
                          <Button variant="outline" size="sm" onClick={() => item.quantity < item.product.stock && handleQuantityUpdate(item.id, item.quantity + 1)} disabled={updating === item.id || item.quantity >= item.product.stock} className="w-8 h-8 p-0">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleRemoveFromCart(item.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon + Order Summary */}
              <div className="lg:col-span-1 space-y-6">
                {/* Coupon Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border sticky top-8">
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 flex justify-between items-center">
                      Coupon Code
                      <span
                        className="text-xs font-extralight text-rose-700 cursor-pointer hover:underline"
                        onClick={handleCouponToggle}
                      >
                        {showCoupon ? "Hide coupons" : "Show all coupons"}
                      </span>
                    </label>

                    <div className="relative mt-2">
                      <Input
                        type="text"
                        value={formData.coupon_code}
                        onChange={(e) => handleInputChange("coupon_code", e.target.value)}
                        placeholder="Enter coupon code"
                        className="pl-3 focus:border-[#084526] focus:ring-[#084526]"
                      />
                      {formData.coupon_code && (
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon(formData.coupon_code)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#084526] hover:bg-[#0a5a2e] rounded text-white px-3 py-1 text-sm"
                        >
                          Apply
                        </button>
                      )}
                    </div>

                    {appliedCoupon && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-800 font-medium">{appliedCoupon.code} applied</span>
                          <span className="text-green-600">-₹{couponDiscount}</span>
                        </div>
                        <Button
                          type="button"
                          onClick={handleRemoveCoupon}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Available Coupons */}
                  {showCoupon && (
                    <div className="max-h-64 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {couponsLoading ? (
                        <div className="flex justify-center py-6">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#084526]"></div>
                        </div>
                      ) : coupons.length > 0 ? (
                        coupons.map((coupon) => {
                          const isEligible = (cartSummary.total_amount ?? 0) >= parseFloat(coupon.min_order_amount);
                          return (
                            <div
                              key={coupon.id}
                              className={`p-3 mb-2 rounded-lg border ${isEligible
                                  ? "border-green-600 bg-white text-black"
                                  : "border-gray-200 bg-gray-50 text-gray-600"
                                }`}
                            >
                              <div className="flex justify-between font-medium mb-1">
                                <span>{coupon.coupon_code}</span>
                                <span className="text-sm">{isEligible ? "Eligible" : "Not Eligible"}</span>
                              </div>
                              <div className="flex justify-between text-sm mb-2">
                                <span>
                                  {coupon.discount_type === "percentage"
                                    ? `${coupon.value}% OFF`
                                    : `₹${coupon.value} OFF`}
                                </span>
                                <span className="text-xs">Min. Order: ₹{coupon.min_order_amount}</span>
                              </div>
                              {!isEligible && (
                                <div className="text-xs text-red-600 mb-2">
                                  Add ₹{(parseFloat(coupon.min_order_amount) - (cartSummary.total_amount ?? 0)).toFixed(2)} more to use
                                </div>
                              )}
                              <button
                                type="button"
                                disabled={!isEligible}
                                onClick={() => isEligible && handleApplyCoupon(coupon.coupon_code)}
                                className={`w-full py-1 rounded text-sm font-medium ${isEligible
                                    ? "bg-[#084526] text-white hover:bg-[#0a5a2e]"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                  }`}
                              >
                                Apply
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-center text-gray-500 py-6">No coupons available</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border sticky top-8">
                  <h3 className="text-2xl font-bold text-[#084526] mb-6">Order Summary</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">
                        ₹{cartSummary.total_amount !== undefined ? cartSummary.total_amount.toFixed(2) : "0.00"}
                      </span>
                    </div>
                    {cartSummary.total_amount !== undefined &&
                      cartSummary.final_amount !== undefined &&
                      cartSummary.total_amount !== cartSummary.final_amount && (
                        <div className="flex justify-between text-lg text-green-600">
                          <span>Discount</span>
                          <span>- ₹{(cartSummary.total_amount - cartSummary.final_amount).toFixed(2)}</span>
                        </div>
                      )}
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold text-green-600">FREE</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-2xl font-bold text-[#084526]">
                        <span>Total</span>
                        <span>
                          ₹{cartSummary.final_amount !== undefined ? cartSummary.final_amount.toFixed(2) : "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate("/checkout")}
                    className="w-full bg-[#084526] hover:bg-[#0a5a2e] text-white py-3 text-lg font-semibold rounded-xl shadow-lg"
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="w-full mt-3 text-[#084526] border-[#084526] hover:bg-[#084526] hover:text-white"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>

            </div>
          ) : (
            <p className="text-center text-gray-500">Your cart is empty.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
