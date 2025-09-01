import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Eye,
  Star,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  Users,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";
import ApiService from "../services/apiService";

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [silverPrice, setSilverPrice] = useState(null);
  const [goldPrice, setGoldPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          productsResponse,
          categoriesResponse,
          silverPriceResponse,
          goldPriceResponse,
        ] = await Promise.allSettled([
          ApiService.getAllProducts({ limit: 8 }),
          ApiService.getAllCategories(true),
          ApiService.getTodaysSilverPrice(),
          ApiService.getTodaysGoldPrice(),
        ]);

        // Handle products
        if (productsResponse.status === "fulfilled") {
          setFeaturedProducts(productsResponse.value.products || []);
        }

        // Handle categories
        if (categoriesResponse.status === "fulfilled") {
          setCategories(categoriesResponse.value.categories || []);
        }

        // Handle silver price
        if (silverPriceResponse.status === "fulfilled") {
          setSilverPrice(silverPriceResponse.value);
        }

        if (goldPriceResponse.status === "fulfilled") {
          setGoldPrice(goldPriceResponse.value);
        }
      } catch (err) {
        setError("Failed to load data");
        console.error("HomePage data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addToCart = async (product) => {
    try {
      const sessionId = ApiService.getSessionId();
      await ApiService.addToCart(sessionId, product._id, 1);
      // You could add a toast notification here
      console.log("Added to cart:", product.title);
      // Trigger storage event to update navbar cart count
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  const calculatePrice = (product) => {
    if (product.constantPrice) {
      return `Rs. ${product.constantPrice.toLocaleString()}`;
    }

    if (silverPrice && product.weightInTola && product.makingCost) {
      const totalPrice =
        silverPrice.pricePerTola * product.weightInTola + product.makingCost;
      return `Rs. ${Math.round(totalPrice).toLocaleString()}`;
    }

    return "Price on request";
  };

  const nextSlide = () => {
    setCurrentSlide(
      (prev) => (prev + 1) % Math.max(1, featuredProducts.length - 2)
    );
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.max(1, featuredProducts.length - 2)) %
        Math.max(1, featuredProducts.length - 2)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p style={{ color: "var(--stone-gray)" }}>
            Loading Buddhist treasures...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative py-8 px-6 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--cream) 0%, var(--light-golden) 100%)",
        }}
      >
        <div className="pattern-lotus absolute inset-0"></div>
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="om-symbol">🕉</span>
                  <span
                    style={{
                      color: "var(--saffron)",
                      fontSize: "1.1rem",
                      fontWeight: "500",
                    }}
                  >
                    Authentic Buddhist Crafts
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-display font-bold leading-snug">
                  Discover Sacred
                  <span className="block" style={{ color: "var(--saffron)" }}>
                    Buddhist Handicrafts
                  </span>
                </h1>
                <p
                  className="text-lg leading-relaxed"
                  style={{ color: "var(--stone-gray)" }}
                >
                  Handcrafted Buddhist statues, thangkas, and spiritual
                  artifacts. Each piece carries the essence of ancient wisdom
                  and modern artistry.
                </p>
              </div>

              {/* Live Price Cards with Metallic Shine */}
              <div className="space-y-3">
                {/* Silver Price */}
                {silverPrice && (
                  <div
                    className="p-3 rounded-lg shadow-sm text-sm transition-transform duration-300 hover:scale-105 relative overflow-hidden"
                    style={{
                      background: `
          linear-gradient(135deg, #f9f9f9 0%, #e6e6e6 50%, #fdfdfd 100%)
        `,
                      border: "1px solid #c5c5c5",
                    }}
                  >
                    {/* Subtle shine overlay */}
                    <div
                      className="absolute top-0 right-0 w-16 h-16 rounded-bl-full"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0))",
                      }}
                    />
                    <div className="flex items-center space-x-2 mb-1 relative z-10">
                      <TrendingUp size={18} style={{ color: "#7a7a7a" }} />
                      <span
                        className="font-semibold"
                        style={{ color: "#5e5e5e" }}
                      >
                        Live Silver Price
                      </span>
                    </div>
                    <div
                      className="text-xl font-bold relative z-10"
                      style={{ color: "#444" }}
                    >
                      Rs. {silverPrice.pricePerTola?.toLocaleString()} per tola
                    </div>
                    <div
                      className="text-lg font-bold"
                      style={{
                        color: silverPrice.dailyChange
                          ?.toString()
                          .startsWith("+")
                          ? "#228B22" // green for positive
                          : silverPrice.dailyChange?.toString().startsWith("-")
                          ? "#D1000A" // red for negative
                          : "#6B6666", // grey for neutral or 0
                      }}
                    >
                      {silverPrice.dailyChange?.toString().startsWith("+") ||
                      silverPrice.dailyChange?.toString().startsWith("-")
                        ? silverPrice.dailyChange?.toLocaleString()
                        : `~${silverPrice.dailyChange?.toLocaleString()}`}
                    </div>

                    <p
                      className="text-xs relative z-10"
                      style={{ color: "#666" }}
                    >
                      Updated:{" "}
                      {new Date(silverPrice.lastScrapedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Gold Price */}
                {goldPrice && (
                  <div
                    className="p-3 rounded-lg shadow-sm text-sm transition-transform duration-300 hover:scale-105 relative overflow-hidden"
                    style={{
                      background: `
          linear-gradient(135deg, #fff9e6 0%, #ffe680 50%, #fff7cc 100%)
        `,
                      border: "1px solid var(--golden)",
                    }}
                  >
                    <div
                      className="absolute top-0 right-0 w-16 h-16 rounded-bl-full"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0))",
                      }}
                    />
                    <div className="flex items-center space-x-2 mb-1 relative z-10">
                      <TrendingUp
                        size={18}
                        style={{ color: "var(--deep-golden)" }}
                      />
                      <span
                        className="font-semibold"
                        style={{ color: "var(--deep-golden)" }}
                      >
                        Live Gold Price
                      </span>
                    </div>
                    <div
                      className="text-xl font-bold relative z-10"
                      style={{ color: "#5c4a00" }}
                    >
                      Rs. {goldPrice.pricePerTola?.toLocaleString()} per tola
                    </div>
                    <div
                      className="text-lg font-bold"
                      style={{
                        color: goldPrice.dailyChange?.toString().startsWith("+")
                          ? "#228B22" // green for positive
                          : goldPrice.dailyChange?.toString().startsWith("-")
                          ? "#D1000A" // red for negative
                          : "#6B6666", // grey for neutral or 0
                      }}
                    >
                      {goldPrice.dailyChange?.toString().startsWith("+") ||
                      goldPrice.dailyChange?.toString().startsWith("-")
                        ? goldPrice.dailyChange?.toLocaleString()
                        : `~${goldPrice.dailyChange?.toLocaleString()}`}
                    </div>
                    <p
                      className="text-xs relative z-10"
                      style={{ color: "var(--stone-gray)" }}
                    >
                      Updated:{" "}
                      {new Date(goldPrice.lastScrapedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products" className="btn btn-primary">
                  <Sparkles size={20} className="mr-2" />
                  Explore Collection
                </Link>
                <Link to="/about" className="btn btn-secondary">
                  Our Story
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="card h-52 overflow-hidden">
                    <img
                      src="https://i.ebayimg.com/images/g/wmwAAOSwXBNkWEUW/s-l1200.jpg"
                      alt="Buddha Statue"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="card h-48 overflow-hidden">
                    <img
                      src="https://i.ebayimg.com/images/g/uJ4AAOSwDlhm0x0P/s-l400.jpg"
                      alt="Crown Buddha"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </div>
                <div className="mt-8">
                  <div className="card h-74 overflow-hidden">
                    <img
                      src="https://i.ebayimg.com/images/g/K2IAAOSwYXJj6Z3o/s-l1200.jpg"
                      alt="Golden Buddha"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-4xl font-display font-bold mb-4"
              style={{ color: "var(--dark-gray)" }}
            >
              Shop by Category
            </h2>
            <p className="text-lg" style={{ color: "var(--stone-gray)" }}>
              Discover our carefully curated collections
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?categoryName=${encodeURIComponent(
                  category.name
                )}`}
                className="card group cursor-pointer"
              >
                <div className="card-body text-center">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--cream)" }}
                  >
                    <span className="text-3xl">
                      {category.name.includes("Gold")
                        ? "🏆"
                        : category.name.includes("Silver")
                        ? "🥈"
                        : category.name.includes("Bronze")
                        ? "🥉"
                        : "🎨"}
                    </span>
                  </div>
                  <h3
                    className="text-xl font-display font-semibold mb-2"
                    style={{ color: "var(--dark-gray)" }}
                  >
                    {category.name}
                  </h3>
                  <p className="mb-4" style={{ color: "var(--stone-gray)" }}>
                    {category.description}
                  </p>
                  {category.productCount !== undefined && (
                    <div
                      className="flex items-center justify-center space-x-2 text-sm"
                      style={{ color: "var(--saffron)" }}
                    >
                      <Package size={16} />
                      <span>{category.productCount} products</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section
        className="py-16 px-6"
        style={{ backgroundColor: "var(--cream)" }}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2
                className="text-4xl font-display font-bold mb-2"
                style={{ color: "var(--dark-gray)" }}
              >
                Featured Products
              </h2>
              <p style={{ color: "var(--stone-gray)" }}>
                Handpicked treasures from our collection
              </p>
            </div>
            <Link to="/products" className="btn btn-secondary">
              View All <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <div key={product._id} className="card group">
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        product.imageUrl ||
                        "https://via.placeholder.com/300x300?text=Product"
                      }
                      alt={product.title}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <Link
                          to={`/product/${product._id}`}
                          className="btn btn-primary btn-sm"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                          }}
                          className="btn btn-golden btn-sm"
                        >
                          <ShoppingCart size={16} />
                        </button>
                      </div>
                    </div>
                    {product.category?.name.includes("Silver") && (
                      <div
                        className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: "var(--saffron)" }}
                      >
                        Live Price
                      </div>
                    )}
                  </div>
                  <div className="card-body">
                    <h3
                      className="font-semibold mb-1 truncate"
                      style={{ color: "var(--dark-gray)" }}
                    >
                      {product.title}
                    </h3>
                    <p
                      className="text-sm mb-2"
                      style={{ color: "var(--stone-gray)" }}
                    >
                      {product.category?.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-lg font-bold"
                        style={{ color: "var(--saffron)" }}
                      >
                        {calculatePrice(product)}
                      </span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className="text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: "var(--stone-gray)" }}>
                No products available at the moment.
              </p>
              <p
                className="text-sm mt-2"
                style={{ color: "var(--stone-gray)" }}
              >
                Please check back later or contact us for more information.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--saffron)" }}
              >
                <Award size={32} className="text-white" />
              </div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--dark-gray)" }}
              >
                Authentic Crafts
              </h3>
              <p style={{ color: "var(--stone-gray)" }}>
                Handcrafted by skilled artisans following traditional methods
              </p>
            </div>
            <div>
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--golden)" }}
              >
                <TrendingUp size={32} className="text-white" />
              </div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--dark-gray)" }}
              >
                Live Pricing
              </h3>
              <p style={{ color: "var(--stone-gray)" }}>
                Real-time silver price updates for transparent pricing
              </p>
            </div>
            <div>
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--maroon)" }}
              >
                <Users size={32} className="text-white" />
              </div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--dark-gray)" }}
              >
                Trusted Service
              </h3>
              <p style={{ color: "var(--stone-gray)" }}>
                Direct communication and personalized service via WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
