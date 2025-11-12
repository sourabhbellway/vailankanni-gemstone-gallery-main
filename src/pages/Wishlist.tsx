import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getWishlistItems, removeFromWishlist } from "@/lib/api/wishlistController";
import { addToCart } from "@/lib/api/cartController";
import { useUserAuth } from "@/context/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, ArrowLeft, ShoppingCart, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuantityDialog from "@/components/QuantityDialog";
import { getImageUrl } from "@/config";
import ProfileLayout from "@/components/ProfileLayout";
import { getUserProfile } from "@/lib/api/userController";
import { Loader2 } from "lucide-react";

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
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getUserProfile(token);
      setProfile(data);
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  }, [token]);

  const fetchWishlistItems = useCallback(async () => {
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
  }, [token, navigate, toast]);

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
    fetchProfile();
    fetchWishlistItems();
  }, [fetchProfile, fetchWishlistItems]);

  const handleSectionChange = (
    section: "profile" | "plans" | "wallet" | "vault" | "customOrders" | "orders" | "wishlist"
  ) => {
    if (section === "wishlist") return;
    if (section === "orders") {
      navigate("/orders");
      return;
    }
    if (section === "wallet") {
      navigate("/wallet");
      return;
    }
    navigate("/profile", { state: { activeSection: section } });
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
      <ProfileLayout
        activeSection="wishlist"
        setActiveSection={handleSectionChange}
        profile={profile}
      >
        <div className="flex justify-center items-center h-80">
          <Loader2 className="w-6 h-6 animate-spin text-[#084526]" />
        </div>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout
      activeSection="wishlist"
      setActiveSection={handleSectionChange}
      profile={profile}
    >
      <div className="space-y-6 border p-6 rounded-2xl bg-gray-50 shadow-sm">
        <div className="flex items-center space-x-3 border-b pb-4">
          <div className="p-3 bg-[#084526] rounded-full">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#084526]">My Wishlist</h1>
            <p className="text-gray-600">Your favorite jewelry pieces</p>
          </div>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-xl p-6 border border-amber-100 group hover:shadow-2xl transition-all duration-300"
              >
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

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-[#084526] transition-colors">
                    {item.product.name}
                  </h3>

                  <div className="space-y-1">
                    <p className="text-sm text-amber-600 font-medium flex items-center">
                      <Sparkles className="w-4 h-4 mr-1" />
                      Purity: {item.product.purity}
                    </p>
                    <p className="text-sm text-gray-600">Weight: {item.product.weight} g</p>
                    <p className="text-xl font-bold text-[#084526]">
                      ₹{Number(item.product.price).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <Button
                      size="sm"
                      className="bg-[#084526] hover:bg-[#0a5a2e] text-white"
                      onClick={() => handleAddToCart(item.product)}
                      disabled={addingToCart === item.product.id}
                    >
                      {addingToCart === item.product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <ShoppingCart className="w-4 h-4 mr-2" />
                      )}
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[#084526] border-[#084526]"
                      onClick={() => navigate(`/plan/${item.product.slug}`)}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Details
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
                <Heart className="w-12 h-12 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Wishlist is empty</h3>
              <p className="text-gray-600 mb-8">Start adding your favourite jewelry items</p>
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

      <QuantityDialog
        open={showQuantityDialog}
        onOpenChange={setShowQuantityDialog}
        onConfirm={handleQuantityConfirm}
        product={selectedProduct}
      />
    </ProfileLayout>
  );
};

export default Wishlist;
