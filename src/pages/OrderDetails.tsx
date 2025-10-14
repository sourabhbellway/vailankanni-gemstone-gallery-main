import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getOrderById } from "@/lib/api/orderController";
import { useUserAuth } from "@/context/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Package, Calendar, MapPin, CreditCard, Gift, MessageSquare, User, Phone, Mail, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/config";

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { token } = useUserAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    if (!token || !orderId) {
      navigate("/signin");
      return;
    }

    setLoading(true);
    try {
      const data = await getOrderById(parseInt(orderId), token);
      if (data.success) {
        setOrder(data.data);
      } else {
        toast({
          title: "Error",
          description: "Order not found",
          variant: "destructive",
        });
        navigate("/orders");
      }
    } catch (err: any) {
      console.error("Order fetch error:", err);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '⚙️';
      case 'confirmed':
        return '✅';
      case 'shipped':
        return '🚚';
      case 'delivered':
        return '🎉';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  const getProductImages = (product: any) => {
    try {
      const imageData = JSON.parse(product.image || "[]");
      if (Array.isArray(imageData) && imageData.length > 0) {
        return getImageUrl(imageData[0]);
      }
    } catch (error) {
      console.error("Error parsing product images:", error);
    }
    return "/placeholder.svg";
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

  if (!order) {
    return (
      <>
        <Header />
        <div className="min-h-screen font-serif ">
          <div className="mx-auto px-4 py-10 ">
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Order not found</h3>
                <p className="text-gray-600 mb-8">The order you're looking for doesn't exist</p>
                <Button
                  onClick={() => navigate("/orders")}
                  className="bg-[#084526] hover:bg-[#0a5a2e] text-white px-8 py-3 text-lg font-semibold rounded-xl"
                >
                  Back to Orders
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
              onClick={() => navigate("/orders")}
              className="mb-4 text-[#084526] hover:text-[#0a5a2e]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#084526] rounded-full">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#084526]">Order Details</h1>
                <p className="text-gray-600">Order #{order.order_code}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status Card */}
              <div className="bg-white rounded-2xl shadow p-6 border ">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Order #{order.order_code}</h2>
                    <p className="text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Placed on {new Date(order.order_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-[#084526] mb-2">₹{order.final_amount}</p>
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      <span className="mr-2">{getStatusIcon(order.status)}</span>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-[#084526] rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-800">Order Placed</p>
                        <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${order.status === 'processing' || order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className="font-medium text-gray-800">Order Processing</p>
                        <p className="text-sm text-gray-600">
                          {order.status === 'processing' || order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered' 
                            ? 'Order is being processed' 
                            : 'Pending processing'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className="font-medium text-gray-800">Order Confirmed</p>
                        <p className="text-sm text-gray-600">
                          {order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered' 
                            ? 'Confirmed by merchant' 
                            : 'Pending confirmation'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className="font-medium text-gray-800">Shipped</p>
                        <p className="text-sm text-gray-600">
                          {order.status === 'shipped' || order.status === 'delivered' 
                            ? 'Order has been shipped' 
                            : 'Not yet shipped'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className="font-medium text-gray-800">Delivered</p>
                        <p className="text-sm text-gray-600">
                          {order.status === 'delivered' 
                            ? 'Order has been delivered' 
                            : 'Expected delivery: ' + new Date(order.expected_delivery).toLocaleDateString()
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border ">
                <div className="flex items-center space-x-2 mb-6">
                  <MapPin className="w-6 h-6 text-[#084526]" />
                  <h2 className="text-2xl font-bold text-[#084526]">Delivery Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Delivery Address</label>
                    <p className="text-gray-800 mt-1">{order.delivery_address}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Payment Method</label>
                      <p className="text-gray-800 mt-1 flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        {order.payment_method}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Expected Delivery</label>
                      <p className="text-gray-800 mt-1 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(order.expected_delivery).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {order.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Special Instructions</label>
                      <p className="text-gray-800 mt-1 flex items-start">
                        <MessageSquare className="w-4 h-4 mr-2 mt-0.5" />
                        {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-6 border ">
                  <div className="flex items-center space-x-2 mb-6">
                    <Package className="w-6 h-6 text-[#084526]" />
                    <h2 className="text-2xl font-bold text-[#084526]">Order Items</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-amber-50 rounded-lg">
                        <img
                          src={getProductImages(item.product)}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg shadow-md"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">{item.product.name}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                            <div>
                              <span className="text-gray-500">Purity:</span>
                              <p className="font-medium text-amber-600">{item.product.purity}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Weight:</span>
                              <p className="font-medium">{item.product.weight}g</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Quantity:</span>
                              <p className="font-medium">{item.quantity}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Unit Price:</span>
                              <p className="font-medium">₹{item.unit_price}</p>
                            </div>
                            {item.product.making_charges && (
                              <div>
                                <span className="text-gray-500">Making Charges:</span>
                                <p className="font-medium">₹{item.product.making_charges}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-500">Stock Available:</span>
                              <p className="font-medium">{item.product.stock}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#084526]">₹{item.total_price}</p>
                          <p className="text-sm text-gray-500">Total</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Information */}
              {order.customer && (
                <div className="bg-white rounded-2xl shadow-xl p-6 border ">
                  <div className="flex items-center space-x-2 mb-6">
                    <User className="w-6 h-6 text-[#084526]" />
                    <h2 className="text-2xl font-bold text-[#084526]">Customer Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-800 mt-1">{order.customer.name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-800 mt-1 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {order.customer.email}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Mobile</label>
                      <p className="text-gray-800 mt-1 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {order.customer.mobile}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">User Code</label>
                      <p className="text-gray-800 mt-1">{order.customer.user_code}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 border  sticky top-8">
                <h3 className="text-2xl font-bold text-[#084526] mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{order.total_amount}</span>
                  </div>
                  
                  {order.items && order.items.length > 0 && order.items[0].product.making_charges && (
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Making Charges</span>
                      <span className="font-semibold">₹{order.items[0].product.making_charges}</span>
                    </div>
                  )}
                  
                  {order.coupon && (
                    <div className="flex justify-between text-lg text-green-600">
                      <span className="flex items-center">
                        <Gift className="w-4 h-4 mr-1" />
                        Discount ({order.coupon.coupon_code})
                      </span>
                      <span className="font-semibold">-₹{order.discount_amount}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-2xl font-bold text-[#084526]">
                      <span>Total</span>
                      <span>₹{order.final_amount}</span>
                    </div>
                  </div>
                </div>

                {order.coupon && (
                  <div className="bg-amber-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Gift className="w-5 h-5 text-amber-600" />
                      <span className="font-semibold text-gray-800">Coupon Applied</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {order.coupon.coupon_code} - {order.coupon.discount_type === 'percentage' ? order.coupon.value + '%' : '₹' + order.coupon.value} off
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Valid until {new Date(order.coupon.valid_until).toLocaleDateString()}
                    </p>
                  </div>
                )}

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

export default OrderDetails;
