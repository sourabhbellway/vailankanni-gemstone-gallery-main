import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Bell,
  BarChart3,
  Tag,
  Image,
  Menu,
  LogOut,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, name, email } = useAuth();
  // console.log(name, email);
  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Product Management", href: "/admin/products", icon: Package },
    { name: "Order Management", href: "/admin/orders", icon: ShoppingCart },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Gold Rate Management", href: "/admin/rates", icon: TrendingUp },
    { name: "Coupon Management", href: "/admin/coupons", icon: Tag },
    { name: "Banner Management", href: "/admin/banners", icon: Image },
    { name: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  const Sidebar = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6 justify-between">
        <Link to="/admin" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              VA
            </span>
          </div>
          {/* <span className="font-semibold">Vailankanni Admin</span> */}
        </Link>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium leading-tight">
              {name || "Admin"}
            </div>
            <div className="text-xs text-muted-foreground leading-tight">
              {email || "admin@example.com"}
            </div>
          </div>
          <Link to="/admin/profile" aria-label="View profile">
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                {(name || "A").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                isActive(item.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-background">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <Link
        to="/admin/profile"
        className="md:hidden fixed top-4 right-4 z-50"
        aria-label="Profile"
      >
        <Button variant="ghost" size="icon">
          <UserIcon className="h-6 w-6" />
        </Button>
      </Link>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:ml-64">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
