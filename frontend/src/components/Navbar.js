import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Home,
  Package,
  Info,
  Phone,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ApiService from "../services/apiService";
import logo from "../logo.jpg";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  // Get cart count on component mount
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const sessionId = ApiService.getSessionId();
        const response = await ApiService.getCart(sessionId);
        setCartCount(response.totalItems || 0);
      } catch (error) {
        console.error("Error fetching cart count:", error);
        setCartCount(0);
      }
    };
    fetchCartCount();

    // Update cart count when localStorage changes
    const handleStorageChange = () => {
      fetchCartCount();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [location]);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Products", path: "/products", icon: Package },
    { name: "About Us", path: "/about", icon: Info },
    { name: "Contact", path: "/contact", icon: Phone },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(
        searchQuery.trim()
      )}`;
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      {/* Main Navbar */}
      <header
        className="shadow-lg sticky top-0 z-50"
        style={{ backgroundColor: "var(--cream)" }}
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center space-x-3 group">
              {/* Logo Image */}
              <div className="w-12 h-12 rounded-full shadow-md group-hover:shadow-lg transition-shadow overflow-hidden">
                <img
                  src={logo}
                  alt="Welcome Craft Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title and Subtitle */}
              <div>
                <h1
                  className="text-2xl font-bold group-hover:transition-colors"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--dark-gray)",
                  }}
                >
                  Welcome Craft
                </h1>
                <p
                  className="text-sm"
                  style={{
                    color: "var(--stone-gray)",
                    fontFamily: "var(--font-primary)",
                  }}
                >
                  Buddhist Handicrafts
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? "text-saffron bg-light-saffron/20 border-b-2 border-saffron"
                        : "text-stone-gray hover:text-saffron hover:bg-saffron/10"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                {isSearchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-64 px-4 py-2 border border-light-gray rounded-l-lg focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-saffron text-white rounded-r-lg hover:bg-deep-saffron transition-colors"
                    >
                      <Search size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="ml-2 p-2 text-stone-gray hover:text-dark-gray"
                    >
                      <X size={18} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-stone-gray hover:text-saffron hover:bg-saffron/10 rounded-lg transition-all"
                  >
                    <Search size={20} />
                  </button>
                )}
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-stone-gray hover:text-saffron hover:bg-saffron/10 rounded-lg transition-all"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-maroon text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-stone-gray hover:text-saffron transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-dark-gray/50"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-80 bg-lotus-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-display font-bold text-dark-gray">
                  Menu
                </h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-stone-gray hover:text-saffron"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 px-4 py-2 border border-light-gray rounded-l-lg focus:outline-none focus:ring-2 focus:ring-saffron"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-saffron text-white rounded-r-lg hover:bg-deep-saffron"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                        isActive
                          ? "text-saffron bg-light-saffron/20 border-l-4 border-saffron"
                          : "text-stone-gray hover:text-saffron hover:bg-saffron/10"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {/* Mobile Cart */}
                <Link
                  to="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 text-stone-gray hover:text-saffron hover:bg-saffron/10 rounded-lg transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingCart size={20} />
                    <span className="font-medium">Cart</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="bg-maroon text-white text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
