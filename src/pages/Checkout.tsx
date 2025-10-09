import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCartItems, getCouponsList, applyCoupon } from "@/lib/api/cartController";
import { createOrder } from "@/lib/api/orderController";
import { useUserAuth } from "@/context/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, MapPin, Calendar, Gift, MessageSquare, Sparkles, Tag, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Checkout = () => {
  const navigate = useNavigate();
  const { token } = useUserAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartId, setCartId] = useState(0)
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showCoupon, setShowCoupon] = useState(false)
  const [serverCartTotal, setServerCartTotal] = useState<number | null>(null);
  const [serverFinalTotal, setServerFinalTotal] = useState<number | null>(null);
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    order_date: "",
    payment: "COD",
    coupon_code: "",
    notes: "",
    // Address fields
    h_no: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  const fetchCartItems = async () => {
    if (!token) {
      navigate("/signin");
      return;
    }

    setLoading(true);
    try {
      const data = await getCartItems(token);
      if (data.success) {
        // Extract cart id from response: backend returns cart_id at root of data
        const payload = data.data || {};
        const items = Array.isArray(payload.items) ? payload.items : [];
        const possibleCartId = payload.cart_id || items?.[0]?.cart_id || null;

        if (possibleCartId) {
          setCartId(possibleCartId);
        } else {
          console.warn("Cart ID not found in cart payload", payload);
        }
        setCartItems(items || []);

      }
    } catch (err: any) {
      console.error("Cart fetch error:", err);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setCouponsLoading(true);
    try {
      const data = await getCouponsList();
      if (data.status) {


        setCoupons(data.data || []);
      }
    } catch (err: any) {
      console.error("Coupons fetch error:", err);
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive",
      });
    } finally {
      setCouponsLoading(false);
    }
  };
  const handleCoupon = () => {
    setShowCoupon(!showCoupon)
  }
  const handleApplyCoupon = async (couponCode: string) => {
    if (!token || !cartId) {
      console.warn("Cannot apply coupon: missing token or cartId", { hasToken: !!token, cartId });
      return; // make sure cartId is available
    }

    try {
      const data = await applyCoupon(cartId, couponCode, token);
      if (data.status) {
        // Refresh items and totals from server response
        const resp = data.data || {};
        setCartId(resp.cart_id || cartId);
        const items = Array.isArray(resp.items) ? resp.items : [];
        setCartItems(items);
        setServerCartTotal(typeof resp.cart_total === 'number' ? resp.cart_total : Number(resp.cart_total));
        setServerFinalTotal(typeof resp.final_total === 'number' ? resp.final_total : Number(resp.final_total));
        setAppliedCoupon({ code: resp.coupon_code, discount_type: resp.discount_type, value: resp.discount_value });
        setCouponDiscount(Number(resp.discount_amount) || 0);
        setFormData(prev => ({ ...prev, coupon_code: couponCode }));

        // map coupon_code to coupon_id from loaded coupons list
        const matched = (coupons || []).find((c) => String(c.coupon_code).toLowerCase() === String(resp.coupon_code).toLowerCase());
        setSelectedCouponId(matched ? Number(matched.id) : null);

        toast({
          title: "Success",
          description: data.message || "Coupon applied successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to apply coupon",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Apply coupon error:", err);
      toast({
        title: "Error",
        description: err?.response?.data?.message || err.message || "Failed to apply coupon",
        variant: "destructive",
      });
    }
  };


  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setFormData(prev => ({ ...prev, coupon_code: "" }));
    setServerCartTotal(null);
    setServerFinalTotal(null);
    setSelectedCouponId(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.order_date || !formData.h_no || !formData.street || !formData.city || !formData.state || !formData.pincode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Combine address fields
    const delivery_address = `${formData.h_no}, ${formData.street}, ${formData.landmark}, ${formData.city}, ${formData.state}, ${formData.pincode}`;

    // Calculate expected delivery (3 days from order date)
    const orderDate = new Date(formData.order_date);
    const expectedDelivery = new Date(orderDate);
    expectedDelivery.setDate(expectedDelivery.getDate() + 3);

    const orderData = {
      cart_id: cartId,
      delivery_address,
      order_date: formData.order_date,
      expected_delivery: expectedDelivery.toISOString().split('T')[0],
      payment: formData.payment,
      coupon_id: selectedCouponId ?? undefined,
      notes: formData.notes,
    };

    setSubmitting(true);
    try {
      const response = await createOrder(orderData, token!);
      console.log("Order creation response:", response);

      // Check if order was created successfully
      if (response.success) {
        console.log("Order created successfully, showing success toast");
        toast({
          title: "Success",
          description: response.message || "Order placed successfully!",
        });
        // Reset form
        setFormData({
          order_date: "",
          payment: "COD",
          coupon_code: "",
          notes: "",
          h_no: "",
          street: "",
          landmark: "",
          city: "",
          state: "",
          pincode: "",
        });
        // Navigate to orders page
        navigate("/orders");
      } else {
        console.log("Order creation failed:", response);
        toast({
          title: "Error",
          description: response.message || "Failed to place order",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || error.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
    fetchCoupons();
  }, []);

  const getProductImages = (product: any) => {
    try {
      const imageData = JSON.parse(product.image || "[]");
      if (Array.isArray(imageData) && imageData.length > 0) {
        return `https://vailankanni-backend.cybenkotechnologies.in/storage/app/public/${imageData[0]}`;
      }
    } catch (error) {
      console.error("Error parsing product images:", error);
    }
    return "/placeholder.svg";
  };

  const uiSubtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
  const totalAmount = serverCartTotal ?? uiSubtotal;
  const finalAmount = serverFinalTotal ?? (totalAmount - couponDiscount);

  // Check if coupon is eligible based on cart value
  const isCouponEligible = (coupon: any) => {
    return totalAmount >= parseFloat(coupon.min_order_amount || 0);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen font-serif ">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#084526]"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen font-serif ">
          <div className="mx-auto px-4 py-10 ">
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-12 h-12 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No items to checkout</h3>
                <p className="text-gray-600 mb-8">Add some beautiful jewelry to your cart first</p>
                <Button
                  onClick={() => navigate("/cart")}
                  className="bg-[#084526] hover:bg-[#0a5a2e] text-white px-8 py-3 text-lg font-semibold rounded-xl"
                >
                  View Cart
                </Button>
              </div>
            </div>
          </div>
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
          {/* Header Section */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 text-[#084526] hover:text-[#0a5a2e]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#084526] rounded-full">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#084526]">Checkout</h1>
                <p className="text-gray-600">Complete your jewelry purchase</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Order Details */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border ">
                  <div className="flex items-center space-x-2 mb-6">
                    <Calendar className="w-6 h-6 text-[#084526]" />
                    <h2 className="text-2xl font-bold text-[#084526]">Order Details</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="order_date" className="text-sm font-semibold text-gray-700">Order Date *</Label>
                      <Input
                        id="order_date"
                        type="date"
                        value={formData.order_date}
                        onChange={(e) => handleInputChange("order_date", e.target.value)}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-2 b focus:border-[#084526] focus:ring-[#084526]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="payment" className="text-sm font-semibold text-gray-700">Payment Mode *</Label>
                      <Select value={formData.payment} onValueChange={(value) => handleInputChange("payment", value)}>
                        <SelectTrigger className="mt-2  focus:border-[#084526] focus:ring-[#084526]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COD">Cash on Delivery (COD)</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="card">Card Payment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-1 ">
                      <Label htmlFor="coupon_code" className="text-sm font-semibold text-gray-700 flex justify-between items-center">Coupon Code  <span className="text-xs font-extralight text-rose-700 cursor-pointer" onClick={handleCoupon}>Show all coupons</span></Label>
                      <div className="relative mt-2">
                        <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="coupon_code"
                          type="text"
                          value={formData.coupon_code}
                          onChange={(e) => handleInputChange("coupon_code", e.target.value)}
                          placeholder="Enter coupon code"
                          className="pl-10  focus:border-[#084526] focus:ring-[#084526]"
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
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
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
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Available Coupons */}
                {
                  showCoupon && (
                    <div className="bg-white rounded-xl shadow-md p-5 border">
                      <div className="flex items-center space-x-2 mb-4">
                        <Tag className="w-5 h-5 text-[#084526]" />
                        <h2 className="text-2xl font-semibold text-[#084526]">Available Coupons</h2>
                      </div>

                      {couponsLoading ? (
                        <div className="flex justify-center py-6">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#084526]"></div>
                        </div>
                      ) : coupons.length > 0 ? (
                        <div className="grid grid-cols-1  gap-3">
                          {coupons.map((coupon) => {
                            const requiredAmount = parseFloat(coupon.min_order_amount) - totalAmount;
                            const isEligible = requiredAmount <= 0;

                            return (
                              <div
                                key={coupon.id}
                                className={`p-3 text-xs rounded-lg border transition-all duration-200 ${isEligible
                                  ? 'border-green-600 bg-white hover:bg-green-50 cursor-pointer'
                                  : 'border-gray-200 bg-gray-50 text-gray-400'
                                  }`}
                                onClick={(e) => {
                                  // Prevent parent click when using button
                                  e.preventDefault();
                                }}
                              >
                                {/* Top Row */}
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className={`font-semibold ${isEligible ? 'text-black' : 'text-gray-500'}`}>
                                    {coupon.coupon_code}
                                  </h3>
                                  {isEligible ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>

                                {/* Discount & Minimum */}
                                <div className="flex items-center justify-between text-sm">
                                  <span className={`${isEligible ? 'text-black font-medium' : 'text-gray-500'}`}>
                                    {coupon.discount_type === 'percentage'
                                      ? `${coupon.value}% OFF`
                                      : `₹${coupon.value} OFF`}
                                  </span>
                                  <span className={`${isEligible ? 'text-green-600' : 'text-gray-400'} text-xs`}>
                                    Min. Order: ₹{coupon.min_order_amount}
                                  </span>
                                </div>

                                {/* Eligibility Message */}
                                {!isEligible && requiredAmount > 0 && (
                                  <div className="mt-1 text-xs text-red-600">
                                    Add products worth ₹{requiredAmount.toFixed(2)} to redeem this coupon
                                  </div>
                                )}

                                {/* Explicit Apply Button */}
                                <div className="mt-2 flex justify-end">
                                  <button
                                    type="button"
                                    disabled={!isEligible}
                                    onClick={() => isEligible && handleApplyCoupon(coupon.coupon_code)}
                                    className={`px-3 py-1 text-xs rounded ${isEligible ? 'bg-[#084526] text-white hover:bg-[#0a5a2e]' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                  >
                                    Apply
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Tag className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                          <p>No coupons available at the moment</p>
                        </div>
                      )}
                    </div>
                  )
                }




                {/* Address Details */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border ">
                  <div className="flex items-center space-x-2 mb-6">
                    <MapPin className="w-6 h-6 text-[#084526]" />
                    <h2 className="text-2xl font-bold text-[#084526]">Delivery Address</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="h_no" className="text-sm font-semibold text-gray-700">House/Flat No. *</Label>
                      <Input
                        id="h_no"
                        type="text"
                        value={formData.h_no}
                        onChange={(e) => handleInputChange("h_no", e.target.value)}
                        required
                        placeholder="e.g., 123"
                        className="mt-2  focus:border-[#084526] focus:ring-[#084526]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="street" className="text-sm font-semibold text-gray-700">Street/Area *</Label>
                      <Input
                        id="street"
                        type="text"
                        value={formData.street}
                        onChange={(e) => handleInputChange("street", e.target.value)}
                        required
                        placeholder="e.g., Main Street"
                        className="mt-2  focus:border-[#084526] focus:ring-[#084526]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="landmark" className="text-sm font-semibold text-gray-700">Landmark</Label>
                      <Input
                        id="landmark"
                        type="text"
                        value={formData.landmark}
                        onChange={(e) => handleInputChange("landmark", e.target.value)}
                        placeholder="e.g., Near City Mall"
                        className="mt-2  focus:border-[#084526] focus:ring-[#084526]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City *</Label>
                      <Input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        required
                        placeholder="e.g., Mumbai"
                        className="mt-2  focus:border-[#084526] focus:ring-[#084526]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="state" className="text-sm font-semibold text-gray-700">State *</Label>
                      <Input
                        id="state"
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        required
                        placeholder="e.g., Maharashtra"
                        className="mt-2  focus:border-[#084526] focus:ring-[#084526]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="pincode" className="text-sm font-semibold text-gray-700">Pincode *</Label>
                      <Input
                        id="pincode"
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value)}
                        required
                        placeholder="e.g., 400001"
                        pattern="[0-9]{6}"
                        className="mt-2  focus:border-[#084526] focus:ring-[#084526]"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border ">
                  <div className="flex items-center space-x-2 mb-6">
                    <MessageSquare className="w-6 h-6 text-[#084526]" />
                    <h2 className="text-2xl font-bold text-[#084526]">Special Instructions</h2>
                  </div>

                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any special delivery instructions..."
                    rows={4}
                    className=" focus:border-[#084526] focus:ring-[#084526]"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#084526] hover:bg-[#0a5a2e] text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg"
                  >
                    {submitting ? "Placing Order..." : "Place Order"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 border  sticky top-8">
                <h3 className="text-2xl font-bold text-[#084526] mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
                      <img
                        src={getProductImages(item.product)}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.product.name}</p>
                        <p className="text-xs text-amber-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-[#084526]">₹{item.total_price}</p>
                    </div>
                  ))}

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-600">Coupon Discount</span>
                        <span className="font-semibold text-green-600">-₹{couponDiscount.toFixed(2)}</span>
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

                <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                  <span>Free shipping on all orders</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
