import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getOrders, deleteOrder } from "@/lib/api/orderController";
import { useUserAuth } from "@/context/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Package, Trash2, Eye, Calendar, MapPin, CreditCard, Gift, MessageSquare, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Orders = () => {
  const navigate = useNavigate();
  const { token } = useUserAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchOrders = async () => {
    if (!token) {
      navigate("/signin");
      return;
    }

    setLoading(true);
    try {
      const data = await getOrders(token);
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err: any) {
      console.error("Orders fetch error:", err);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!token) return;

    setDeleting(orderId);
    try {
      const data = await deleteOrder(orderId, token);
      if (data.success) {
        toast({
          title: "Success",
          description: "Order deleted successfully",
        });
        fetchOrders();
      }
    } catch (err: any) {
      console.error("Delete order error:", err);
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

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

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen font-serif bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#084526]"></div>
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
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#084526]">My Orders</h1>
                <p className="text-gray-600">Track your precious jewelry orders</p>
              </div>
            </div>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border p-6 ">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-amber-100 rounded-full">
                        <Package className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Order #{order.order_code}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Placed on {new Date(order.order_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#084526] mb-2">₹{order.final_amount}</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        <span className="mr-1">{getStatusIcon(order.status)}</span>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">Delivery Address:</span>
                      </div>
                      <p className="text-sm text-gray-800 pl-6">{order.delivery_address}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-medium">Payment Method:</span>
                      </div>
                      <p className="text-sm text-gray-800 pl-6">{order.payment_method}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Expected Delivery:</span>
                      </div>
                      <p className="text-sm text-gray-800 pl-6">
                        {new Date(order.expected_delivery).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Additional Information */}
                  {(order.notes || order.coupon) && (
                    <div className="space-y-4 mb-6 p-4 bg-amber-50 rounded-lg">
                      {order.notes && (
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-gray-700">Special Instructions:</span>
                            <p className="text-sm text-gray-800 mt-1">{order.notes}</p>
                          </div>
                        </div>
                      )}
                      {order.coupon && (
                        <div className="flex items-start space-x-2">
                          <Gift className="w-4 h-4 text-amber-600 mt-0.5" />
                          <div>
                            <span className="text-sm font-medium text-gray-700">Coupon Applied:</span>
                            <p className="text-sm text-gray-800 mt-1">
                              {order.coupon.coupon_code} ({order.coupon.discount_type === 'percentage' ? order.coupon.value + '%' : '₹' + order.coupon.value} off)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-amber-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Sparkles className="w-4 h-4" />
                      <span>Order ID: {order.id}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/order-details/${order.id}`)}
                        className="text-[#084526] hover:text-white hover:bg-[#084526] border-[#084526]"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Show Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteOrder(order.id)}
                        disabled={deleting === order.id}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {deleting === order.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow p-12 max-w-md mx-auto">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No orders yet</h3>
                <p className="text-gray-600 mb-8">Your order history will appear here</p>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate("/")}
                    className="w-full bg-[#084526] hover:bg-[#0a5a2e] text-white px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    Explore Collections
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/cart")}
                    className="w-full text-[#084526] border-[#084526] hover:bg-[#084526] hover:text-white"
                  >
                    View Cart
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Orders;