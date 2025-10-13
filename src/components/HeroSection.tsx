import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import banner from "@/assets/banner.png";
import banner1 from "@/assets/banner1.png";
import banner2 from "@/assets/banner2.png";
import heroBanner from "@/assets/firstslide.png";
import bridalBanner from "@/assets/bridal-banner.jpg";
import diamondBanner from "@/assets/diamond-banner.jpg";

const banners = [
  {
    id: 1,
    image: banner,
    title: "Timeless Elegance",
    subtitle: "Unlock the Best Jewellery Deals—See How Much You Can Save!",
    badge: "Exquisite Craftsmanship Since 1985",
    primaryButton: "Price comparision",
  },
  {
    id: 2,
    image: banner1,
    title: "Bridal Splendor",
    subtitle: "Enjoy Free In-Store Gold Testing—Experience Trust Firsthand!",
    badge: "Traditional Wedding Jewelry",
    primaryButton: "Book an Appointment",
  },
  {
    id: 3,
    image: banner2,
    title: "Diamond Dreams",
    subtitle: "Unlock the Best Jewellery Deals—See How Much You Can Save!",
    badge: "Certified Diamond Collection",
    primaryButton: "Price comparision",
  },
];

const HeroSection = () => {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const currentBannerData = banners[currentBanner];

  return (
    <section
      id="home"
      className="relative -mt-20 min-h-[96vh] flex items-center justify-center overflow-hidden"
    >
      {/* Background Images with Transition */}
      <div className="absolute inset-0 z-0">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-300 ${
              index === currentBanner ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary/40 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevBanner}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
      >
        <ChevronLeft className="h-6 w-6 text-white group-hover:translate-x-[-2px] transition-transform" />
      </button>
      <button
        onClick={nextBanner}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
      >
        <ChevronRight className="h-6 w-6 text-white group-hover:translate-x-[2px] transition-transform" />
      </button>

      {/* Banner Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentBanner
                ? "bg-secondary scale-125"
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative  z-10 container mx-auto px-4 text-center text-primary-foreground">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Badge */}
          {/* <div className="inline-flex items-center space-x-2 bg-secondary/20 backdrop-blur-sm border border-secondary/30 rounded-full px-6 py-2 mb-8 animate-scale-in font-serif">
            <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
            <span className="text-sm font-medium text-secondary">
              {currentBannerData.badge}
            </span>
          </div> */}

          {/* Main Heading with Transition */}
          {/* <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight animate-fade-in font-serif">
            <span className="block leading-tight">
              {currentBannerData.title.split(" ")[0]}
            </span>
            <span className="block bg-gradient-to-r from-secondary to-secondary-light leading-tight bg-clip-text text-transparent">
              {currentBannerData.title.split(" ")[1]}
            </span>
          </h1> */}

          {/* Subheading */}
          {/* <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-4xl mx-auto leading-relaxed animate-fade-in font-serif">
            {currentBannerData.subtitle}
          </p> */}

          {/* CTA Buttons */}
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            {currentBannerData.primaryButton === "Book an Appointment" ? (
              <a href="/gold-services#appointment">
                <Button
                  size="lg"
                  className=" bg-gradient-to-r from-[#8e6e00] via-[#fce56b] to-[#fff2b2] text-black font-semibold px-6 py-2 rounded-full  transition-all duration-300 hover:brightness-125  hover:scale-105 relative overflow-hidden shimmer-btn"
                >
                  {currentBannerData.primaryButton}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
            ) : (
              <a href="/gold-services#compare">
                <Button
                  size="lg"
                  className=" bg-gradient-to-r from-[#8e6e00] via-[#fce56b] to-[#fff2b2] text-black font-semibold px-6 py-2 rounded-full  transition-all duration-300 hover:brightness-125  hover:scale-105 relative overflow-hidden shimmer-btn"
                >
                  {currentBannerData.primaryButton}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
            )}
          </div> */}

          {/* Trust Indicators */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            {[
              {
                value: "35+",
                label: "Years Experience",
                delay: "200ms",
              },
              {
                value: "15K+",
                label: "Happy Customers",
                delay: "400ms",
              },
              {
                value: "100%",
                label: "Certified Gold",
                delay: "600ms",
              },
            ].map((item, idx) => (
              <div
                key={item.label}
                className="text-center animate-scale-in transition-transform duration-300 bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-secondary/30 hover:scale-105 hover:shadow-2xl hover:border-secondary/60 p-6 flex flex-col items-center cursor-pointer"
                style={{ animationDelay: item.delay }}
              >
                <div className="text-3xl font-extrabold text-secondary mb-2 drop-shadow-sm">
                  {item.value}
                </div>
                <div className="text-sm text-primary-foreground/80 font-medium">
                  {item.label}
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-1/4 right-10 w-20 h-20 bg-secondary/20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-1/3 left-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-300"></div>
      <div className="absolute top-1/3 left-20 w-16 h-16 bg-secondary/15 rounded-full blur-xl animate-pulse delay-700"></div>
    </section>
  );
};

export default HeroSection;
