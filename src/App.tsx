import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import CollectionPage from "./pages/CollectionPage";
import Schemes from "./pages/Schemes";
import GoldServices from "./pages/GoldServices";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PlanDetails from "./pages/PlanDetails";
import Payments from "./pages/Payments";
import BridalCollection from "./pages/BridalCollection";
import ExploreCollection from "./pages/ExploreCollection";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import OrderDetails from "./pages/admin/OrderDetails";
import UserManagement from "./pages/admin/UserManagement";
import BannerManagement from "./pages/admin/BannerManagement";
import CouponManagement from "./pages/admin/CouponManagement";
import RateManagement from "./pages/admin/RateManagement";
import ReportsAnalytics from "./pages/admin/ReportsAnalytics";
import NotificationManagement from "./pages/admin/NotificationManagement";
import Settings from "./pages/admin/Settings";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { UserAuthProvider } from "./context/UserAuthContext";
import ProtectedUserRoute from "./components/ProtectedUserRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminProfile from "./pages/admin/AdminProfile";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import UserOrderDetails from "./pages/OrderDetails";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <UserAuthProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/collection/:collectionId" element={<CollectionPage />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/gold-services" element={<GoldServices />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/plan/:planName" element={<PlanDetails />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/bridal-collection" element={<BridalCollection />} />
            <Route path="/explore-collection" element={<ExploreCollection />} />
            <Route
              path="/profile"
              element={
                <ProtectedUserRoute>
                  <Profile />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedUserRoute>
                  <Cart />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedUserRoute>
                  <Checkout />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedUserRoute>
                  <Orders />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedUserRoute>
                  <Wishlist />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="/order-details/:orderId"
              element={
                <ProtectedUserRoute>
                  <UserOrderDetails />
                </ProtectedUserRoute>
              }
            />
            <Route path="/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ProductManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <OrderManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders/:orderId"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <OrderDetails />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <UserManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/banners"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <BannerManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <CouponManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rates"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <RateManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ReportsAnalytics />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <NotificationManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Settings />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminProfile />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </UserAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
