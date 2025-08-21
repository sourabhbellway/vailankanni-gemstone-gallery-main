import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import goldCollection from "@/assets/goldjewllery.avif";
import diamondCollection from "@/assets/diamond-collection.jpg";
import jadauCollection from "@/assets/jadau-collection.jpg";
import antiqueCollection from "@/assets/antique-collection.jpg";
import silverCollection from "@/assets/silver-collection.jpg";
import mensCollection from "@/assets/mens-collection.jpg";
import gemstoneCollection from "@/assets/gemstone-collection.jpg";
import bridalBanner from "@/assets/bridal-banner.jpg";
import earrings from "@/assets/earrings.jpg";
import fingerrings from "@/assets/fingerrings.jpg";
import mangalsutra from "@/assets/mangalsutra.jpg";
import pendants from "@/assets/pendants.jpg";
import bracelets from "@/assets/bracelets.jpg";
import chain from "@/assets/chain.jpg";
import bangles from "@/assets/bangles.jpg";
import frame1 from "@/assets/frame1.jpg";
import frame2 from "@/assets/frame2.jpg";
import frame3 from "@/assets/frame3.jpg";
import { Link } from "react-router-dom";


const collections = [
  {
    id: 1,
    name: "Gold Collection",
    description: "Exquisite 22K gold jewelry crafted with traditional techniques and modern aesthetics",
    image: goldCollection,
    gradient: "from-secondary/80 to-secondary-light/60",
    products: 150,
    rating: 4.9
  },
  {
    id: 2,
    name: "Diamond Collection", 
    description: "Sparkling diamonds set in elegant designs for life's most precious moments",
    image: diamondCollection,
    gradient: "from-primary/80 to-primary-glow/60",
    products: 85,
    rating: 4.9
  },
  {
    id: 3,
    name: "Jadau Collection",
    description: "Traditional Jadau jewelry featuring uncut diamonds and precious gemstones",
    image: jadauCollection,
    gradient: "from-purple-600/80 to-pink-500/60",
    products: 65,
    rating: 4.8
  },
  {
    id: 4,
    name: "Antique Collection",
    description: "Heritage designs inspired by royal Indian jewelry traditions",
    image: antiqueCollection,
    gradient: "from-amber-700/80 to-orange-500/60",
    products: 45,
    rating: 4.8
  },
  {
    id: 5,
    name: "Bridal Collection",
    description: "Complete bridal sets for your most special day with traditional elegance",
    image: goldCollection,
    gradient: "from-rose-600/80 to-pink-500/60",
    products: 75,
    rating: 5.0
  },
  {
    id: 6,
    name: "Silver Jewelry",
    description: "Contemporary silver designs perfect for everyday elegance and style",
    image: silverCollection,
    gradient: "from-slate-600/80 to-gray-400/60",
    products: 120,
    rating: 4.7
  },
  {
    id: 7,
    name: "Men's Collection",
    description: "Sophisticated jewelry designs crafted specifically for the modern gentleman",
    image: mensCollection,
    gradient: "from-stone-700/80 to-stone-500/60",
    products: 55,
    rating: 4.6
  },
  {
    id: 8,
    name: "Gemstone Jewelry",
    description: "Precious and semi-precious stones set in beautiful gold and silver designs",
    image: gemstoneCollection,
    gradient: "from-emerald-600/80 to-green-500/60",
    products: 90,
    rating: 4.8
  }
];

export const categoryData = [
    { name: "Earrings", image: earrings, link: "/category/earrings" },
    { name: "Bangles", image: bangles, link: "/category/bangles" },
    { name: "Pendants", image: pendants, link: "/category/pendants" },
    { name: "Mangalsutra", image: mangalsutra, link: "/category/mangalsutra" },
    { name: "Bracelets", image: bracelets, link: "/category/bracelets" },
    { name: "Finger Rings", image: fingerrings, link: "/category/finger-rings" },
    { name: "Chains", image: chain, link: "/category/chains" },
    { name: "Gemstone Jewelry", image: gemstoneCollection, link: "/category/gemstone" },
];

const CollectionsSection = () => {
  return (
    <section id="collections" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl md:text-5xl  text-primary mb-6 font-serif">
            Our Signature Collections
          </h2>
          <p className="text-xl text-muted-foreground max-w-5xl mx-auto leading-relaxed font-serif">
            {/* Each piece tells a story of artistry, tradition, and timeless beauty crafted by master jewelers */}
           "Every jewel whispers a legacy—of hands that craft, traditions that endure, and beauty that lasts forever."
          </p>
        </div>

        {/* Featured Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {collections.map((collection, index) => (
            <Card 
              key={collection.id} 
              className="group overflow-hidden border-0 shadow-elegant hover:shadow-luxury transition-all duration-500 animate-scale-in transform hover:scale-105 h-96"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden h-full">
                <img 
                  src={collection.image} 
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${collection.gradient} opacity-50 group-hover:opacity-40 transition-opacity duration-300`}></div>
                
                {/* Product Count Badge */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
                  {collection.products}+ Items
                </div>

                {/* Rating Badge */}
                <div className="absolute top-4 left-4 bg-secondary/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <Star className="h-3 w-3 text-secondary fill-current" />
                  <span className="text-white text-sm font-medium">{collection.rating}</span>
                </div>
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-bold mb-2 transform group-hover:translate-y-0 translate-y-2 transition-transform duration-300 font-serif">
                    {collection.name}
                  </h3>
                  <p className="text-white/90 text-sm mb-4 transform group-hover:translate-y-0 translate-y-4 transition-transform duration-300 delay-75 line-clamp-2">
                    {collection.description}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="relative overflow-hidden bg-white/20 hover:bg-white hover:text-primary border-white/30 backdrop-blur-sm group-hover:bg-white group-hover:text-primary transform group-hover:translate-y-0 translate-y-4 transition-all duration-300 delay-150"
                  >
                    <span className="absolute w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    View Collection
                    <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Banner Section */}
        <div className="text-center my-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl text-primary font-serif ">Explore our newly launched collections</h2>
        </div>
        <div className="my-20 grid md:grid-cols-2 gap-2 animate-fade-in">
          {/* Left Banner */}
          <div className="relative rounded-lg overflow-hidden group h-[600px]">
            <img src={frame2} alt="Bridal Collection" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute inset-0 flex flex-col items-start justify-end p-8 text-white">
              <h3 className="text-3xl font-bold font-serif mb-2">The Sparkling Pendant Collection</h3>
              <p className="mb-4 max-w-sm">Crafted for your most memorable day. Explore our exquisite pendant sets.</p>
              <Button variant="secondary" className="bg-white/20 hover:bg-white hover:text-primary backdrop-blur-sm">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Banners */}
          <div className="grid grid-rows-2 gap-2 h-[600px]">
            {/* Top Right */}
            <div className="relative rounded-lg overflow-hidden group">
              <img src={frame1} alt="Diamond Collection" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-start justify-end p-8 text-white">
                <h3 className="text-2xl font-bold font-serif mb-2">Modern Minimal Gold Collection</h3>
                <p className="mb-4">Sparkle with our latest gold jewelry.</p>
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white hover:text-primary backdrop-blur-sm">
                  View Diamonds <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Bottom Right */}
            <div className="relative rounded-lg overflow-hidden group">
              <img src={frame3} alt="Gold Collection" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-start justify-end p-8 text-white">
                <h3 className="text-2xl font-bold font-serif mb-2">Golden Grace Collection</h3>
                <p className="mb-4">Discover timeless 22k gold designs.</p>
                <Button variant="secondary" size="sm" className="w-12 h-12 p-0 flex items-center justify-center bg-white/20 rounded-full hover:bg-white hover:text-primary backdrop-blur-sm">
                  <ArrowRight className="-rotate-45" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Shop by Categories */}
        <div className="my-20 animate-fade-in">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl text-primary font-serif mb-2">
              Find Your Perfect Match
            </h2>
            <p className="text-xl text-muted-foreground font-serif">
              Shop by Categories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12">
            {categoryData.slice(0, 7).map((category) => (
              <Link to={category.link} key={category.name} className="group text-center transition-transform transform hover:-translate-y-2 duration-300">
                <div className="h-[45vh]   rounded-lg overflow-hidden  hover:shadow-elegant transition-shadow duration-300">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <h4 className="mt-4 font-serif text-2xl text-primary group-hover:text-primary-glow transition-colors duration-300">{category.name}</h4>
              </Link>
            ))}
            <Link to="#collections" className="group text-center transition-transform transform hover:-translate-y-2 duration-300">
              <div className="h-[45vh]  bg-gradient-subtle rounded-lg flex items-center justify-center p-2 hover:shadow-elegant transition-shadow duration-300 border-2 border-dashed border-primary/20 group-hover:border-primary/40">
                <div className="text-center text-primary">
                  <span className="text-xl font-semibold"><span className="text-3xl text-primary font-bold">10+</span> <br /> Categories to choose</span>
                </div>
              </div>
              <h4 className="mt-4 font-semibold text-lg text-primary group-hover:text-primary-glow transition-colors duration-300">View All Categories</h4>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-gradient-luxury hover:shadow-luxury transition-all duration-300 px-8 py-4 text-lg transform hover:scale-105 relative overflow-hidden group"
          >
            <span className="absolute w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            Explore All Collections
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CollectionsSection;