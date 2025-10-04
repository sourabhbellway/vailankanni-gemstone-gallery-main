import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getWishlistItems, removeFromWishlist } from "@/lib/api/wishlistController";
import { addToCart } from "@/lib/api/cartController";
import { useUserAuth } from "@/context/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, ArrowLeft, ShoppingCart, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuantityDialog from "@/components/QuantityDialog";

const Wishlist = () => {
  const navigate = useNavigate();
  const { token } = useUserAuth();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const fetchWishlistItems = async () => {
    if (!token) {
      navigate("/signin");
      return;
    }

    setLoading(true);
    try {
      const data = await getWishlistItems(token);
      if (data.success) {
        setWishlistItems(data.data.items || []);
      }
    } catch (err: any) {
      console.error("Wishlist fetch error:", err);
      toast({
        title: "Error",
        description: "Failed to load wishlist items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (wishlistId: number) => {
    if (!token) return;

    setRemoving(wishlistId);
    try {
      const data = await removeFromWishlist({ wishlist_id: wishlistId }, token);
      if (data.success) {
        toast({
          title: "Success",
          description: "Item removed from wishlist",
        });
        fetchWishlistItems();
      }
    } catch (err: any) {
      console.error("Remove from wishlist error:", err);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    } finally {
      setRemoving(null);
    }
  };

  const handleAddToCart = (product: any) => {
    setSelectedProduct(product);
    setShowQuantityDialog(true);
  };

  const handleQuantityConfirm = async (quantity: number) => {
    if (!token || !selectedProduct) return;

    setAddingToCart(selectedProduct.id);
    try {
      const data = await addToCart({ product_id: selectedProduct.id, quantity }, token);
      if (data.success) {
        toast({
          title: "Success",
          description: "Item added to cart successfully",
        });
        setShowQuantityDialog(false);
        setSelectedProduct(null);
      }
    } catch (err: any) {
      console.error("Add to cart error:", err);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(null);
    }
  };

  useEffect(() => {
    fetchWishlistItems();
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
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#084526]">My Wishlist</h1>
                <p className="text-gray-600">Your favorite jewelry pieces</p>
              </div>
            </div>
          </div>

          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-xl p-6 border border-amber-100 group hover:shadow-2xl transition-all duration-300">
                  {/* Product Image */}
                  <div className="relative mb-4">
                    <img
                      src={getProductImages(item.product)}
                      alt={item.product.name}
                      className="w-full h-48 object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        disabled={removing === item.id}
                        className="w-8 h-8 p-0 bg-white/90 hover:bg-red-50 text-red-600 hover:text-red-800 border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute top-3 left-3">
                      <div className="bg-[#084526] text-white px-2 py-1 rounded-full text-xs font-bold">
                        {item.product.purity}
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-[#084526] transition-colors">
                      {item.product.name}
                    </h3>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-amber-600 font-medium flex items-center">
                        <Sparkles className="w-4 h-4 mr-1" />
                        Purity: {item.product.purity}
                      </p>
                      <p className="text-sm text-gray-600">Weight: {item.product.weight}g</p>
                      <p className="text-sm text-gray-600">Stock: {item.product.stock} available</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-[#084526]">₹{item.product.price}</p>
                      <div className="text-sm text-gray-500">
                        {item.product.stock > 0 ? (
                          <span className="text-green-600 font-medium">In Stock</span>
                        ) : (
                          <span className="text-red-600 font-medium">Out of Stock</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <Button
                        onClick={() => handleAddToCart(item.product)}
                        disabled={addingToCart === item.product.id || item.product.stock === 0}
                        className="w-full bg-[#084526] hover:bg-[#0a5a2e] text-white rounded-xl"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {addingToCart === item.product.id ? "Adding..." : "Add to Cart"}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/product/${item.product.id}`)}
                        className="w-full text-[#084526] border-[#084526] hover:bg-[#084526] hover:text-white rounded-xl"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-12 h-12 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Your wishlist is empty</h3>
                <p className="text-gray-600 mb-8">Add some beautiful jewelry to your wishlist</p>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate("/collections")}
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

      {/* Quantity Dialog */}
      <QuantityDialog
        isOpen={showQuantityDialog}
        onClose={() => {
          setShowQuantityDialog(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleQuantityConfirm}
        productName={selectedProduct?.name || ""}
        maxStock={selectedProduct?.stock || 0}
        loading={addingToCart === selectedProduct?.id}
      />

      <Footer />
    </>
  );
};

export default Wishlist;
