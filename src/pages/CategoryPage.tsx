import Header from "@/components/Header";
import { useParams } from "react-router-dom";
import { categoryData } from "@/components/CollectionsSection";
import { useEffect } from "react";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import banglesImg from "@/assets/bangles.jpg";
import diamondCollectionImg from "@/assets/diamond-collection.jpg";
import antiqueCollectionImg from "@/assets/antique-collection.jpg";
import goldCollectionImg from "@/assets/gold-collection.jpg";
import goldJewelleryImg from "@/assets/goldjewllery.avif";
import { Heart } from "lucide-react";
import diamondBannerImg from "@/assets/diamond-banner.jpg";
import jadauCollectionImg from "@/assets/jadau-collection.jpg";
import silverCollectionImg from "@/assets/silver-collection.jpg";
import mensCollectionImg from "@/assets/mens-collection.jpg";
import gemstoneCollectionImg from "@/assets/gemstone-collection.jpg";
import bridalBannerImg from "@/assets/bridal-banner.jpg";
import earringsImg from "@/assets/earrings.jpg";
import fingerringsImg from "@/assets/fingerrings.jpg";
import mangalsutraImg from "@/assets/mangalsutra.jpg";
import pendantsImg from "@/assets/pendants.jpg";
import braceletsImg from "@/assets/bracelets.jpg";
import chainImg from "@/assets/chain.jpg";
import { useNavigate } from "react-router-dom";

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const category = categoryData.find((cat) => cat.link.endsWith(categorySlug));
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categorySlug]);

  return (
    <>
      <Header />
      <main className="relative mx-auto min-h-screen bg-white">
        {category ? (
          <div className="flex flex-col items-center w-full px-4">
            {/* Filters & Sorting Section */}
            <div className="w-full max-w-8xl mt-8 mb-6">
              {/* Breadcrumb */}
              <nav className="flex items-center text-sm text-gray-500 mb-2">
                <span className="hover:underline cursor-pointer">Home</span>
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
                  <span className="text-lg text-gray-500">(2157 results)</span>
                </div>
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Sort By:</span>
                  <select className="border rounded px-3 py-1 focus:outline-none">
                    <option>Best Matches</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest First</option>
                  </select>
                </div>
              </div>
              {/* Filter Chips */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button className="flex items-center border rounded-full px-4 py-2 gap-2 text-primary hover:bg-primary/10 transition">
                  <span className="text-lg">&#43;</span> ₹25,000 - ₹50,000
                </button>
                <button className="flex items-center border rounded-full px-4 py-2 gap-2 text-primary hover:bg-primary/10 transition">
                  <span className="text-lg">&#43;</span> Women
                </button>
                <button className="flex items-center border rounded-full px-4 py-2 gap-2 text-primary hover:bg-primary/10 transition">
                  <span className="text-lg">&#43;</span> Gold Jewellery
                </button>
                <button className="flex items-center border rounded-full px-4 py-2 gap-2 text-primary hover:bg-primary/10 transition">
                  <span className="text-lg">&#43;</span> 22
                </button>
                <button className="flex items-center border rounded-full px-4 py-2 gap-2 text-primary hover:bg-primary/10 transition">
                  +Show More
                </button>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="w-full max-w-8xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
              {mockProducts.map((product) => (
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
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full transition-transform duration-500"
                    />
                    <img
                      src={product.imageHover}
                      alt={product.name + " hover"}
                      className="object-cover w-full h-full absolute top-0 left-0 transition-transform duration-500 translate-x-full group-hover:translate-x-0"
                    />
                  </div>
                  {/* Product Name */}
                  <div className="text-lg font-serif font-medium text-gray-900 mb-2 px-2 text-center">
                    {product.name}
                  </div>
                  {/* Pricing */}
                  <div className="flex items-center gap-3 mb-2 px-2 justify-center">
                    <span className="text-2xl font-semibold text-gray-900">
                      ₹ {product.discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-gray-400 line-through text-lg">
                      ₹ {product.price.toLocaleString()}
                    </span>
                  </div>
                  {/* Offer */}
                  <div className="mt-auto px-2">
                    <div className="bg-yellow-100 text-yellow-800 rounded-lg flex items-center justify-center py-2 text-base font-medium gap-2 mb-3">
                      <span className="inline-block">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 inline-block mr-1 text-yellow-700"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6l4 2"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                          />
                        </svg>
                      </span>
                      {product.offer}
                    </div>
                    {/* Add to Cart Button */}
                    <button
                      className="w-full bg-primary text-white font-semibold py-2 rounded-lg shadow hover:bg-primary/90 transition-colors text-base mt-1"
                      onClick={() => navigate("/signin")}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-2xl text-red-500 font-serif">
            Category Not Found
          </div>
        )}
      </main>
      <ContactSection />
      <Footer />
    </>
  );
};

export default CategoryPage;

// Add mock product data at the top of the file, after imports
// Mock product data
const mockProducts = [
  {
    id: 1,
    name: "Elegant Gold Bangle",
    image: banglesImg,
    imageHover: diamondBannerImg,
    price: 40000,
    discountedPrice: 20000,
    offer: "Flat 50% Off",
  },
  {
    id: 2,
    name: "Classic Diamond Bangle",
    image: diamondCollectionImg,
    imageHover: jadauCollectionImg,
    price: 60000,
    discountedPrice: 30000,
    offer: "Flat 50% Off",
  },
  {
    id: 3,
    name: "Antique Bangle Set",
    image: antiqueCollectionImg,
    imageHover: silverCollectionImg,
    price: 50000,
    discountedPrice: 25000,
    offer: "Flat 50% Off",
  },
  {
    id: 4,
    name: "Modern Gold Bangle",
    image: goldCollectionImg,
    imageHover: mensCollectionImg,
    price: 45000,
    discountedPrice: 22500,
    offer: "Flat 50% Off",
  },
  {
    id: 5,
    name: "Timeless Fancy Diamond Bangle",
    image: diamondCollectionImg,
    imageHover: gemstoneCollectionImg,
    price: 66517,
    discountedPrice: 63191,
    offer: "Flat 5% off",
  },
  {
    id: 6,
    name: "Traditional Antique Kada",
    image: antiqueCollectionImg,
    imageHover: bridalBannerImg,
    price: 52000,
    discountedPrice: 39000,
    offer: "Flat 25% Off",
  },
  {
    id: 7,
    name: "Classic Gold Kada",
    image: goldCollectionImg,
    imageHover: earringsImg,
    price: 48000,
    discountedPrice: 38400,
    offer: "Flat 20% Off",
  },
  {
    id: 8,
    name: "Designer Gold Bangle",
    image: banglesImg,
    imageHover: fingerringsImg,
    price: 42000,
    discountedPrice: 33600,
    offer: "Flat 20% Off",
  },
  {
    id: 9,
    name: "Antique Floral Bangle",
    image: antiqueCollectionImg,
    imageHover: mangalsutraImg,
    price: 55000,
    discountedPrice: 38500,
    offer: "Flat 30% Off",
  },
  {
    id: 10,
    name: "Diamond Studded Bangle",
    image: diamondCollectionImg,
    imageHover: pendantsImg,
    price: 70000,
    discountedPrice: 56000,
    offer: "Flat 20% Off",
  },
  {
    id: 11,
    name: "Minimalist Gold Bangle",
    image: goldCollectionImg,
    imageHover: braceletsImg,
    price: 41000,
    discountedPrice: 32800,
    offer: "Flat 20% Off",
  },
  {
    id: 12,
    name: "Elegant Antique Kada",
    image: antiqueCollectionImg,
    imageHover: chainImg,
    price: 53000,
    discountedPrice: 39750,
    offer: "Flat 25% Off",
  },
];
