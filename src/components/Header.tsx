import { useState, useEffect, useRef } from "react";
import { Menu, X, Phone, Mail, MapPin, ChevronDown, ShoppingCart, Heart, User} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import logo from "@/assets/logo.jpg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUserAuth } from "@/context/UserAuthContext";
import { getPublicCollections } from "@/lib/api/publicController";
import {getCartItems} from "@/lib/api/cartController"
// import NotificationBell from "./NotificationBell";
// Add shimmer animation styles
const shimmerStyle = `
  .shimmer-btn::before {
    content: '';
    position: absolute;
    top: 0; left: -75%;
    width: 50%; height: 100%;
    background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  .shimmer-btn:hover::before {
    opacity: 1;
    animation: shimmer-move 1s linear forwards;
  }
  @keyframes shimmer-move {
    0% { left: -75%; }
    100% { left: 125%; }
  }
  @keyframes slide-in-from-left {
    from { transform: translateX(-200%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slide-out-to-left {
    from { transform: translateX(200%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoAnim, setLogoAnim] = useState(""); // '' | 'in' | 'out'
  const [cartCount, setCartCount] = useState(0);
  const [collections, setCollections] = useState<any[]>([]);
  const prevScrolledRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const isSchemes = location.pathname === "/schemes";
const {token}= useUserAuth()
  // Helper for scroll or navigate+scroll
  const handleMenuClick = (e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const sectionId = href.replace("#", "");
      if (isHome) {
        // Already on home, just scroll
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Not on home, navigate then scroll
        navigate("/", { replace: false });
        // Wait for navigation, then scroll
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 100); // Delay to allow home to render
      }
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 0;
      setIsScrolled(scrolled);
      if (scrolled && !prevScrolledRef.current) {
        setLogoAnim("in");
      } else if (!scrolled && prevScrolledRef.current) {
        setLogoAnim("out");
      }
      prevScrolledRef.current = scrolled;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch collections on component mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await getPublicCollections();
        if (response.data.success) {
          setCollections(response.data.data || []);
        }
      } catch (error) {
        // Error fetching collections - silently fail
      }
    };
    const fetchCartCount = async () => {
      try {
        if (!token) {
          setCartCount(0);
          return;
        }
        const response = await getCartItems(token);
        if (response?.success) {
          setCartCount(response.data.items?.length || 0);
        }
      } catch (e) {
        // ignore transient errors
      }
    };

    fetchCollections();
    fetchCartCount();

    // Listen for global cart updates to keep badge in sync
    const handleCartUpdated = () => {
      fetchCartCount();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('cart:updated', handleCartUpdated);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cart:updated', handleCartUpdated);
      }
    };
  }, [token]);

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "#about" },
    // Schemes handled separately with dropdown
    { name: "Reviews", href: "#reviews" },
    { name: "Contact", href: "#contact" },
  ];

  // Collections will be populated from API

  const { isAuthenticated, logout } = useUserAuth();



  return (
    <>
      <style>{shimmerStyle + "\nhtml { scroll-behavior: smooth; }"}</style>
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4">
        <div className=" mx-auto flex flex-wrap items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Phone className="h-3 w-3" />
              <span>+91 95451 11124</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="h-3 w-3" />
              <span>vailankannijewellers89@gmail.com</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>Panjim, Goa</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`  sticky top-0 z-50 transition-colors duration-300 ${isScrolled ? "bg-white" : "bg-transparent"
          }`}
      >
        <div className={`${isScrolled ? "mx-auto px-4" : "mx-auto px-4"}`}>
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              className={`flex items-center space-x-2 ${logoAnim === "in"
                ? "animate-[slide-in-from-left_0.5s_ease-in-out]"
                : logoAnim === "out"
                  ? "animate-[slide-out-to-left_0.5s_ease-in-out]"
                  : ""
                }`}
              onAnimationEnd={() => setLogoAnim("")}
            >
              <div className="h-12 w-12 rounded-full flex items-center justify-center overflow-hidden bg-white">
                <img
                  src={logo}
                  alt="Vailankanni Logo"
                  className="object-cover h-12 w-12"
                />
              </div>
              <div className="font-serif">
                <h1
                  className={`text-2xl  ${isScrolled
                    ? "text-[#084526]"
                    : isHome || isSchemes
                      ? "text-white"
                      : "text-black"
                    }
                `}
                >
                  Vailankanni
                </h1>
                <p
                  className={`text-xs ${isScrolled
                    ? "text-[#8e6e00]"
                    : isHome || isSchemes
                      ? "text-[#fce56b]"
                      : "text-black"
                    } uppercase tracking-widest`}
                >
                  Jewellers
                </p>
              </div>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden lg:flex items-center space-x-8">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`transition-all duration-300 font-medium relative group ${isScrolled
                    ? "text-[#084526]"
                    : isHome || isSchemes
                      ? "text-white"
                      : "text-black"
                    }`}
                  onClick={
                    item.href.startsWith("#")
                      ? (e) => handleMenuClick(e, item.href)
                      : undefined
                  }
                >
                  {item.name}
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
              ))}

              {/* Schemes Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`transition-all duration-300 font-medium flex items-center space-x-1 group  ${isScrolled
                    ? "text-[#084526]"
                    : isHome || isSchemes
                      ? "text-white"
                      : "text-black"
                    }`}
                >
                  <span>Schemes</span>
                  <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border-border shadow-luxury animate-scale-in">
                  <DropdownMenuItem asChild>
                    <Link to="/schemes" className="w-full">Easy monthly installments</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/plan/custom" className="w-full">Gold saving scheme</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Categories Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`transition-all duration-300 font-medium flex items-center space-x-1 group  ${isScrolled
                    ? "text-[#084526]"
                    : isHome || isSchemes
                      ? "text-white"
                      : "text-black"
                    }`}
                >
                  <span>Collections</span>
                  <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border-border shadow-luxury animate-scale-in">
                  {collections.map((collection) => (
                    <DropdownMenuItem
                      key={collection.id}
                      className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                    >
                      <Link to={`/collection/${collection.id}`} className="w-full">
                        {collection.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Desktop Auth Buttons & Profile */}
            <div className="hidden md:flex items-center gap-4">
           
              {!isAuthenticated && (
                <Link
                  to="/signin"
                  className={`${isScrolled
                    ? "bg-[#084526] text-white"
                    : isHome || isSchemes
                      ? "bg-white text-[#084526]"
                      : "bg-white text-[#084526]"
                    } font-semibold px-4 py-2 rounded-full transition-all duration-300 hover:opacity-80`}
                  type="button"
                >
                  Sign In
                </Link>
              )}

              {/* User Profile Avatar */}
              {isAuthenticated && (
              <div className="flex space-x-6 items-center">
              {/* 🛒 Cart */}
              <Link to="/cart" className={`${isScrolled
                    ? "text-[#084526]"
                    : isHome || isSchemes
                      ? "text-white"
                      : "text-black"} hover:opacity-80 transition relative`}>
                        <span className="text-white absolute -right-2 -top-2 text-[10px] bg-red-500 h-4 w-4 block flex items-center justify-center rounded-full">{cartCount}</span>
                <ShoppingCart className="h-5 w-5" />
              </Link>
        
              {/* ❤️ Wishlist */}
              <Link to="/wishlist" className={`${isScrolled
                    ? "text-[#084526]"
                    : isHome || isSchemes
                      ? "text-white"
                      : "text-black"} hover:opacity-80 transition`}>
                <Heart className="h-5 w-5" />
              </Link>
        
              {/* 👤 Profile */}
              <Link to="/profile" className={`${isScrolled
                    ? "text-[#084526]"
                    : isHome || isSchemes
                      ? "text-white"
                      : "text-black"} hover:opacity-80 transition`}>
                <User className="h-5 w-5" />
              </Link>
              {/* <NotificationBell /> */}
            </div>
              )}
        
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`lg:hidden p-2  transition-all duration-300 hover:scale-110 `}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="text-[#084526]" />
              ) : (
                <Menu
                  className={`${isScrolled
                    ? "text-[#084526]"
                    : isHome || isSchemes
                      ? "text-white"
                      : "text-white"
                    }`}
                />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border animate-fade-in">
              <nav className="flex flex-col space-y-4">
                {menuItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-foreground hover:text-primary transition-all duration-300 font-medium py-2 hover:translate-x-2"
                    onClick={
                      item.href.startsWith("#")
                        ? (e) => handleMenuClick(e, item.href)
                        : () => setIsMenuOpen(false)
                    }
                  >
                    {item.name}
                  </a>
                ))}

                {/* Mobile Schemes */}
                <div className="border-t border-border pt-4 mt-2">
                  <h3 className="text-primary font-semibold mb-3">Schemes</h3>
                  <Link
                    to="/schemes"
                    className="block text-muted-foreground hover:text-primary transition-all duration-300 py-1 pl-4 hover:translate-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Plans
                  </Link>
                  <Link
                    to="/plan/custom"
                    className="block text-muted-foreground hover:text-primary transition-all duration-300 py-1 pl-4 hover:translate-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Custom plan
                  </Link>
                </div>

                {/* Mobile Collections */}
                <div className="border-t border-border pt-4 mt-4">
                  <h3 className="text-primary font-semibold mb-3">
                    Collections
                  </h3>
                  {collections.map((collection) => (
                    <Link
                      key={collection.id}
                      to={`/collection/${collection.id}`}
                      className="block text-muted-foreground hover:text-primary transition-all duration-300 py-1 pl-4 hover:translate-x-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {collection.name}
                    </Link>
                  ))}
                </div>

                <Button className="bg-gradient-gold hover:shadow-gold transition-all duration-300 w-full mt-4 transform hover:scale-105">
                  Get Quote
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
