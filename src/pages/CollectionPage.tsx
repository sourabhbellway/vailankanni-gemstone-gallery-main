import Header from "@/components/Header";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { Heart} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCollectionProducts } from "@/lib/api/publicController";
import { API_BASE_URL } from "@/config";

const CollectionPage = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [collectionId]);

  useEffect(() => {
    const fetchCollectionData = async () => {
      if (!collectionId) return;
      
      try {
        setLoading(true);
        const response = await getCollectionProducts(collectionId);
        if (response.data.success) {
          setCollection(response.data.data.collection);
          setProducts(response.data.data.products || []);
        }
      } catch (error) {
        console.error("Error fetching collection data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionData();
  }, [collectionId]);

  const getProductImages = (product: any) => {
    try {
      const imageData = JSON.parse(product.image || "[]");
      if (Array.isArray(imageData) && imageData.length > 0) {
        return {
          main: `https://vailankanni-backend.cybenkotechnologies.in/storage/app/public/${imageData[0]}`,
          hover: imageData[1] ? `https://vailankanni-backend.cybenkotechnologies.in/storage/app/public/${imageData[1]}` : `https://vailankanni-backend.cybenkotechnologies.in/storage/app/public/${imageData[0]}`
        };
      }
    } catch (error) {
      console.error("Error parsing product images:", error);
    }
    return {
      main: "/placeholder.svg",
      hover: "/placeholder.svg"
    };
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
                  Loading Collection...
                </h1>
                <p className="text-lg text-gray-500">Please wait while we fetch the collection data.</p>
              </div>
            </div>
          </div>
        </main>
        <ContactSection />
        <Footer />
      </>
    );
  }

  if (!collection) {
    return (
      <>
        <Header />
        <main className="relative mx-auto min-h-screen bg-white">
          <div className="flex flex-col items-center w-full px-4">
            <div className="w-full max-w-8xl mt-8 mb-6">
              <div className="text-center">
                <h1 className="text-3xl font-serif font-bold text-red-500 mb-4">
                  Collection Not Found
                </h1>
                <p className="text-lg text-gray-500">The collection you're looking for doesn't exist.</p>
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
              <Link to={`/`} className="hover:underline cursor-pointer">Home</Link>
              <span className="mx-2">&#62;</span>
              <span className="">Collections</span>
              <span className="mx-2">&#62;</span>
              <span className="text-primary font-semibold">
                {collection.name}
              </span>
            </nav>
            {/* Title & Results */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex items-center gap-3 mb-2 md:mb-0">
                <h1 className="text-3xl font-serif font-bold text-gray-900">
                  {collection.name}
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
            {/* Collection Description */}
            {collection.description && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {collection.description}
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
                      onClick={() => navigate("/signin")}
                    >
                      <Heart className="w-6 h-6" />
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
                    {/* Product Details */}
                    <div className="text-sm text-gray-600 mb-2 px-2 text-center">
                      <div>Purity: {product.purity || 'N/A'}</div>
                      <div>Weight: {product.weight ? `${product.weight}g` : 'N/A'}</div>
                      {product.making_charges && (
                        <div>Making Charges: ₹{product.making_charges}</div>
                      )}
                    </div>
                    {/* Pricing */}
                    <div className="flex items-center gap-3 mb-2 px-2 justify-center">
                      <span className="text-2xl font-semibold text-gray-900">
                        ₹ {product.price ? Number(product.price).toLocaleString() : 'N/A'}
                      </span>
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
                        onClick={() => product.stock > 0 ? navigate("/signin") : null}
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
                  No products found in this collection
                </h3>
                <p className="text-lg text-gray-400">
                  This collection doesn't have any products yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <ContactSection />
      <Footer />
    </>
  );
};

export default CollectionPage;
