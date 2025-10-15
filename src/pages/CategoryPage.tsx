import Header from "@/components/Header";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCategoryProducts, getPublicCategories } from "@/lib/api/publicController";
import { addToCart } from "@/lib/api/cartController";
import { addToWishlist } from "@/lib/api/wishlistController";
import { useUserAuth } from "@/context/UserAuthContext";
import { useToast } from "@/hooks/use-toast";
import QuantityDialog from "@/components/QuantityDialog";
import { API_BASE_URL, getImageUrl } from "@/config";

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useUserAuth();
  const { toast } = useToast();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantityDialog, setQuantityDialog] = useState<{
    isOpen: boolean;
    product: any;
  }>({ isOpen: false, product: null });
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categorySlug]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!categorySlug) return;
      
      try {
        setLoading(true);
        const response = await getCategoryProducts(categorySlug);
        if (response.data.success) {
          setCategory(response.data.data.category);
          setProducts(response.data.data.products || []);
        }
      } catch (error) {
        // Error fetching category data - silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categorySlug]);

  const getProductImages = (product: any) => {
    try {
      const imageData = JSON.parse(product.image || "[]");
      if (Array.isArray(imageData) && imageData.length > 0) {
        return {
          main: getImageUrl(imageData[0]),
          hover: imageData[1] ? getImageUrl(imageData[1]) : getImageUrl(imageData[0])
        };
      }
    } catch (error) {
      // Error parsing product images - silently fail
    }
    return {
      main: "/placeholder.svg",
      hover: "/placeholder.svg"
    };
  };

  const handleAddToCart = (product: any) => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    setQuantityDialog({ isOpen: true, product });
  };

  const handleConfirmAddToCart = async (quantity: number, size?: string | number) => {
    if (!token || !quantityDialog.product) return;
    
    setAddingToCart(true);
    try {
      const data = await addToCart(
        { product_id: quantityDialog.product.id, quantity, size },
        token
      );
      if (data.success) {
        toast({
          title: "Success",
          description: "Product added to cart successfully",
        });
        setQuantityDialog({ isOpen: false, product: null });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to add product to cart",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (product: any) => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    
    if (!token) return;
    
    setAddingToWishlist(product.id);
    try {
      const data = await addToWishlist({ product_id: product.id }, token);
      if (data.success) {
        toast({
          title: "Success",
          description: "Product added to wishlist successfully",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to add product to wishlist",
        variant: "destructive",
      });
    } finally {
      setAddingToWishlist(null);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="relative mx-auto min-h-screen bg-white">
          <div className="flex flex-col items-center w-full px-4">
            <div className="w-full max-w-8xl mt-8 mb-6">
              <div className="text-center">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                  Loading Category...
                </h1>
                <p className="text-lg text-gray-500">Please wait while we fetch the category data.</p>
              </div>
            </div>
          </div>
        </main>
        <ContactSection />
        <Footer />
      </>
    );
  }

  if (!category) {
    return (
      <>
        <Header />
        <main className="relative mx-auto min-h-screen bg-white">
          <div className="flex flex-col items-center w-full px-4">
            <div className="w-full max-w-8xl mt-8 mb-6">
              <div className="text-center">
                <h1 className="text-3xl font-serif font-bold text-red-500 mb-4">
                  Category Not Found
                </h1>
                <p className="text-lg text-gray-500">The category you're looking for doesn't exist.</p>
              </div>
            </div>
          </div>
        </main>
        <ContactSection />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="relative mx-auto min-h-screen bg-white">
        <div className="flex flex-col items-center w-full px-4">
          {/* Filters & Sorting Section */}
          <div className="w-full max-w-8xl mt-8 mb-6">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-gray-500 mb-2">
              <span className="hover:underline cursor-pointer">Home</span>
              <span className="mx-2">&#62;</span>
              <span className="hover:underline cursor-pointer">Categories</span>
              <span className="mx-2">&#62;</span>
              <span className="text-primary font-semibold">
                {category.name}
              </span>
            </nav>
            {/* Title & Results */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex items-center gap-3 mb-2 md:mb-0">
                <h1 className="text-3xl font-serif font-bold text-gray-900">
                  {category.name}
                </h1>
                <span className="text-lg text-gray-500">({products.length} results)</span>
              </div>
              {/* Sort Dropdown */}
              {/* <div className="flex items-center gap-2">
                <span className="text-gray-600">Sort By:</span>
                <select className="border rounded px-3 py-1 focus:outline-none">
                  <option>Best Matches</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                </select>
              </div> */}
            </div>
            {/* Category Description */}
            {category.description && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {category.description}
                </p>
              </div>
            )}
            {/* Filter Chips */}
            {/* <div className="flex flex-wrap gap-3 mb-6">
              <button className="flex items-center border rounded-full px-4 py-2 gap-2 text-primary hover:bg-primary/10 transition">
                <span className="text-lg">&#43;</span> All Purity
              </button>
              <button className="flex items-center border rounded-full px-4 py-2 gap-2 text-primary hover:bg-primary/10 transition">
                <span className="text-lg">&#43;</span> In Stock
              </button>
              <button className="flex items-center border rounded-full px-4 py-2 gap-2 text-primary hover:bg-primary/10 transition">
                <span className="text-lg">&#43;</span> Active
              </button>
              <button className="flex items-center border rounded-full px-4 py-2 gap-2 text-primary hover:bg-primary/10 transition">
                +Show More
              </button>
            </div> */}
          </div>

          {/* Product Cards Grid */}
          <div className="w-full max-w-8xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
            {products.length > 0 ? (
              products.map((product) => {
                const images = getProductImages(product);
                return (
                  <div
                    key={product.id}
                    className="relative bg-white border rounded-2xl shadow p-4 flex flex-col items-stretch group hover:shadow-lg transition min-h-[420px]"
                  >
                    {/* Wishlist Icon */}
                    <button
                      className="absolute top-6 right-6 text-gray-400 hover:text-red-500 z-10 bg-white rounded-full p-2 shadow border border-gray-200"
                      onClick={() => handleAddToWishlist(product)}
                      disabled={addingToWishlist === product.id}
                    >
                      <Heart className={`w-6 h-6 ${addingToWishlist === product.id ? 'animate-pulse' : ''}`} />
                    </button>
                    {/* Product Image */}
                    <div className="relative rounded-xl overflow-hidden border border-gray-100 mb-4 aspect-square bg-white flex items-center justify-center group">
                      <img
                        src={images.main}
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-500"
                      />
                      <img
                        src={images.hover}
                        alt={product.name + " hover"}
                        className="object-cover w-full h-full absolute top-0 left-0 transition-transform duration-500 translate-x-full group-hover:translate-x-0"
                      />
                    </div>
                    {/* Product Name */}
                    <div className="text-lg font-serif font-medium text-gray-900 mb-2 px-2 text-center">
                      {product.name}
                    </div>
                    {/* Product Details removed from card; shown in modal */}
                    {/* Pricing */}
                    <div className="flex items-center gap-3 mb-2 px-2 justify-center">
                      <span className="text-2xl font-semibold text-gray-900">
                        ₹ {product.price ? Number(product.price).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    {/* Dummy sizes row */}
                    <div className="px-2 mb-2 text-xs text-gray-500 text-center">
                      Sizes: {(() => {
                        try {
                          const sizes = product?.sizes;
                          const list = typeof sizes === 'string' ? JSON.parse(sizes) : Array.isArray(sizes) ? sizes : [];
                          const names = list.slice(0, 3).map((s: any) => String(s.size));
                          return names.length ? names.join(', ') + (list.length > 3 ? '…' : '') : 'Select in cart';
                        } catch { return 'Select in cart'; }
                      })()}
                    </div>

                    {/* Stock Status */}
                    <div className="mt-auto px-2">
                      <div className={`rounded-lg flex items-center justify-center py-2 text-base font-medium gap-2 mb-3 ${
                        product.stock > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <span className="inline-block">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5 inline-block mr-1"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </span>
                        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                      </div>
                      {/* Add to Cart Button */}
                      <button
                        className={`w-full font-semibold py-2 rounded-lg shadow transition-colors text-base mt-1 ${
                          product.stock > 0
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={() => product.stock > 0 ? handleAddToCart(product) : null}
                        disabled={product.stock === 0}
                      >
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-16">
                <h3 className="text-2xl font-serif text-gray-500 mb-4">
                  No products found in this category
                </h3>
                <p className="text-lg text-gray-400">
                  This category doesn't have any products yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <ContactSection />
      <Footer />
      
      {/* Quantity Dialog */}
      <QuantityDialog
        isOpen={quantityDialog.isOpen}
        onClose={() => setQuantityDialog({ isOpen: false, product: null })}
        onConfirm={handleConfirmAddToCart}
        productName={quantityDialog.product?.name || ""}
        maxStock={quantityDialog.product?.stock || 0}
        loading={addingToCart}
        purity={quantityDialog.product?.purity}
        weight={quantityDialog.product?.weight}
        makingCharges={quantityDialog.product?.making_charges}
        sizes={(() => {
          try {
            const sizes = quantityDialog.product?.sizes;
            if (!sizes) return [];
            if (typeof sizes === 'string') return JSON.parse(sizes);
            if (Array.isArray(sizes)) return sizes;
            return [];
          } catch {
            return [];
          }
        })()}
      />
    </>
  );
};

export default CategoryPage;
