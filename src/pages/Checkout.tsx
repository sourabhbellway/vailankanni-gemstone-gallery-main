import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCartItems, } from "@/lib/api/cartController";
import { createOrder } from "@/lib/api/orderController";
import { useUserAuth } from "@/context/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, MapPin, Calendar, Gift, MessageSquare, Sparkles, Tag, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getImageUrl } from "@/config";

const Checkout = () => {
  const navigate = useNavigate();
  const { token } = useUserAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartId, setCartId] = useState(0)
  // const [coupons, setCoupons] = useState<any[]>([]);
  // const [couponsLoading, setCouponsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  // const [showCoupon, setShowCoupon] = useState(false)
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
        }
        setCartItems(items || []);

      }
    } catch (err: any) {
      // Cart fetch error - silently fail
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

      // Check if order was created successfully
      if (response.success) {
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
        toast({
          title: "Error",
          description: response.message || "Failed to place order",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      // Order creation error - silently fail
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
   
  }, []);

  const getProductImages = (product: any) => {
    try {
      const imageData = JSON.parse(product.image || "[]");
      if (Array.isArray(imageData) && imageData.length > 0) {
        return getImageUrl(imageData[0]);
      }
    } catch (error) {
      // Error parsing product images - silently fail
    }
    return "/placeholder.svg";
  };

  const uiSubtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
  const totalAmount = serverCartTotal ?? uiSubtotal;
  const finalAmount = serverFinalTotal ?? (totalAmount - couponDiscount);



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

                   
                  </div>
                </div>

             



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
