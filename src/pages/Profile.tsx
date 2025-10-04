import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getUserProfile } from "@/lib/api/userController";
import { getCartItems } from "@/lib/api/cartController";
import { getWishlistItems } from "@/lib/api/wishlistController";
import { getOrders } from "@/lib/api/orderController";
import { useUserAuth } from "@/context/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Heart, User, Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const navigate = useNavigate();
  const { token, logout } = useUserAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<any | null>(null);
  const [cartCount, setCartCount] = React.useState(0);
  const [wishlistCount, setWishlistCount] = React.useState(0);
  const [ordersCount, setOrdersCount] = React.useState(0);

  const fetchProfile = async () => {
    if (!token) {
      window.location.href = "/signin";
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching profile with token:", token);
      const data = await getUserProfile(token);
      setProfile(data);
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      if (err?.code === 'ETIMEDOUT' || err?.message?.includes('timeout')) {
        setError("Request timed out. Please check your internet connection and try again.");
      } else if (err?.response?.status === 401 || err?.response?.status === 403) {
        setError("Session expired or unauthorized. Please sign in again.");
        logout();
        setTimeout(() => {
          window.location.href = "/signin";
        }, 2000);
      } else {
        const serverMsg = err?.response?.data?.message;
        setError(serverMsg || err?.message || "Failed to load profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    if (!token) return;

    try {
      // Fetch cart count
      const cartData = await getCartItems(token);
      if (cartData.success) {
        setCartCount(cartData.data.items?.length || 0);
      }

      // Fetch wishlist count
      const wishlistData = await getWishlistItems(token);
      if (wishlistData.success) {
        setWishlistCount(wishlistData.data.items?.length || 0);
      }

      // Fetch orders count
      const ordersData = await getOrders(token);
      if (ordersData.success) {
        setOrdersCount(ordersData.data?.length || 0);
      }
    } catch (err: any) {
      console.error("Error fetching counts:", err);
    }
  };

  React.useEffect(() => {
    fetchProfile();
    fetchCounts();
  }, []);

  const renderProfileSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#084526]">Profile Information</h2>
      {profile && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className=" mb-6">
            <h3 className="text-xl font-semibold text-gray-800 uppercase">
              {profile.data.name}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-800 font-semibold">
                  {profile?.data.name ?? "-"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-gray-800 font-semibold">
                  {profile?.data.email ?? "-"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                <p className="text-gray-800 font-semibold">
                  {profile?.data.mobile ?? "-"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Account Status</label>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${profile?.data.status
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {profile?.data.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Last Login</label>
                <p className="text-gray-800 font-semibold text-xs">
                  {profile?.data.last_login_at ?? "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen font-serif bg-gray-50">
        <div className="mx-auto px-4 py-10">

          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#084526]"></div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg text-sm bg-red-100 text-red-700 border border-red-300">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={fetchProfile}
                  className="ml-4 px-4 py-2 bg-[#084526] text-white rounded hover:bg-[#0a5a2e] transition-colors text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {profile && (
            <div className="flex gap-8">
              {/* Left Sidebar */}
              <div className="w-80 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {profile.data.name}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {profile?.data.user_code}
                    </p>
                  </div>

                  <nav className="space-y-2">
                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors bg-[#084526] text-white"
                    >
                      <User className="w-5 h-5" />
                      <span>View Profile</span>
                    </button>

                    <button
                      onClick={() => navigate("/cart")}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Cart ({cartCount})</span>
                    </button>

                    <button
                      onClick={() => navigate("/wishlist")}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
                    >
                      <Heart className="w-5 h-5" />
                      <span>Wishlist ({wishlistCount})</span>
                    </button>

                    <button
                      onClick={() => navigate("/orders")}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100"
                    >
                      <Package className="w-5 h-5" />
                      <span>Orders ({ordersCount})</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        window.location.href = "/signin";
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </nav>
                </div>
              </div>

              {/* Right Content Area */}
              <div className="flex-1">
                {renderProfileSection()}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;



