import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCartItems, updateCartQuantity, removeFromCart } from "@/lib/api/cartController";
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

  const handleQuantityUpdate = async (cartItemId: number, newQuantity: number) => {
    if (!token) return;

    setUpdating(cartItemId);
    try {
      const data = await updateCartQuantity({ item_id: cartItemId, quantity: newQuantity }, token);
      if (data.success) {
        toast({
          title: "Success",
          description: "Quantity updated successfully",
        });
        fetchCartItems();
      }
    } catch (err: any) {
      console.error("Quantity update error:", err);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveFromCart = async (cartItemId: number) => {
    if (!token) return;

    try {
      const data = await removeFromCart({ item_id: cartItemId }, token);
      if (data.success) {
        toast({
          title: "Success",
          description: "Item removed from cart",
        });
        fetchCartItems();
      }
    } catch (err: any) {
      console.error("Remove from cart error:", err);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    fetchCartItems();
  }, []);

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

  const totalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0);

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
                  <div key={item.id} className="bg-white rounded-2xl shadow-xl p-6 border ">
                    <div className="flex items-center space-x-6">
                      {/* Product Image */}
                      <div className="relative">
                        <img
                          src={getProductImages(item.product)}
                          alt={item.product.name}
                          className="w-32 h-32 object-cover rounded-xl shadow-lg"
                        />
                        <div className="absolute -top-2 -right-2 bg-[#084526] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {item.quantity}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{item.product.name}</h3>
                        <div className="space-y-1 mb-4">
                          <p className="text-sm text-amber-600 font-medium">
                            <Sparkles className="w-4 h-4 inline mr-1" />
                            Purity: {item.product.purity}
                          </p>
                          <p className="text-sm text-gray-600">Weight: {item.product.weight}g</p>
                          <p className="text-sm text-gray-600">Stock: {item.product.stock} available</p>
                        </div>
                        <p className="text-2xl font-bold text-[#084526]">₹{item.unit_price}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (item.quantity > 1) {
                                handleQuantityUpdate(item.id, item.quantity - 1);
                              }
                            }}
                            disabled={updating === item.id || item.quantity <= 1}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={item.product.stock}
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value);
                              if (newQuantity >= 1 && newQuantity <= item.product.stock) {
                                handleQuantityUpdate(item.id, newQuantity);
                              }
                            }}
                            className="w-16 text-center"
                            disabled={updating === item.id}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (item.quantity < item.product.stock) {
                                handleQuantityUpdate(item.id, item.quantity + 1);
                              }
                            }}
                            disabled={updating === item.id || item.quantity >= item.product.stock}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl p-6 border  sticky top-8">
                  <h3 className="text-2xl font-bold text-[#084526] mb-6">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold text-green-600">FREE</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-2xl font-bold text-[#084526]">
                        <span>Total</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
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
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow p-12 max-w-md mx-auto">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h3>
                <p className="text-gray-600 mb-8">Add some beautiful jewelry to get started</p>
                <Button
                  onClick={() => navigate("/")}
                  className="bg-[#084526] hover:bg-[#0a5a2e] text-white px-8 py-3 text-lg font-semibold rounded-xl"
                >
                  Explore Collections
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
