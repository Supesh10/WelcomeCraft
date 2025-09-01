import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Filter,
  Grid,
  List,
  Search,
  ShoppingCart,
  Eye,
  Star,
  TrendingUp,
  X,
  ChevronDown,
} from "lucide-react";
import ApiService from "../services/apiService";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [silverPrice, setSilverPrice] = useState(null);
  const [goldPrice, setGoldPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("categoryName") || ""
  );
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [selectedCategory, sortBy, currentPage]);

  useEffect(() => {
    fetchCategories();
    fetchSilverPrice();
    fetchGoldPrice();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: productsPerPage,
        sort: sortBy,
        search: searchTerm,
        categoryName: selectedCategory,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
      };

      const response = await ApiService.getAllProducts(params);
      setProducts(response.products || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalProducts(response.pagination?.totalProducts || 0);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await ApiService.getAllCategories(true);
      setCategories(response.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchSilverPrice = async () => {
    try {
      const response = await ApiService.getTodaysSilverPrice();
      setSilverPrice(response);
    } catch (error) {
      console.error("Failed to fetch silver price:", error);
    }
  };

  const fetchGoldPrice = async () => {
    try {
      const response = await ApiService.getTodaysGoldPrice();
      setGoldPrice(response);
    } catch (error) {
      console.error("Failed to fetch gold price:", error);
    }
  };

  const addToCart = async (product) => {
    try {
      const sessionId = ApiService.getSessionId();
      await ApiService.addToCart(sessionId, product._id, 1);
      console.log("Added to cart:", product.title);
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
      return `Silver per tola + Making charge Rs. ${silverPrice.pricePerTola.toString()} + ${product.makingCost.toString()}`;
    }

    return "Price on request";
  };

  const handleCategoryFilter = (categoryName) => {
    setSelectedCategory(categoryName);
    setCurrentPage(1);
    if (categoryName) {
      searchParams.set("categoryName", categoryName);
    } else {
      searchParams.delete("categoryName");
    }
    setSearchParams(searchParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchTerm("");
    setPriceRange({ min: "", max: "" });
    setCurrentPage(1);
    searchParams.delete("categoryName");
    searchParams.delete("search");
    setSearchParams(searchParams);
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p style={{ color: "var(--stone-gray)" }}>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      {/* Header Section */}
      <section className="py-12 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1
              className="text-4xl lg:text-5xl font-display font-bold mb-4"
              style={{ color: "var(--dark-gray)" }}
            >
              Our Collection
            </h1>
            <p className="text-lg" style={{ color: "var(--stone-gray)" }}>
              Discover authentic handcrafted Buddhist artifacts and spiritual
              treasures.
            </p>
          </div>

          {/* Live Silver & Gold Price Banner */}
          {(silverPrice || goldPrice) && (
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 mb-6">
              {/* Silver Price Card */}
              {silverPrice && (
                <div
                  className="flex-1 p-3 rounded-lg shadow-md text-sm transition-transform duration-300 hover:scale-105"
                  style={{
                    backgroundColor: "#C0C0C0", // silver background
                    border: "1px solid #A9A9A9",
                  }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp size={16} style={{ color: "#4B4B4B" }} />
                    <span
                      className="font-semibold"
                      style={{ color: "#4B4B4B" }}
                    >
                      Silver Price: Rs.{" "}
                      {silverPrice.pricePerTola?.toLocaleString()} per tola
                    </span>
                  </div>
                </div>
              )}

              {/* Gold Price Card */}
              {goldPrice && (
                <div
                  className="flex-1 p-3 rounded-lg shadow-md text-sm transition-transform duration-300 hover:scale-105"
                  style={{
                    backgroundColor: "#FFD700", // gold background
                    border: "1px solid #DAA520",
                  }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp size={16} style={{ color: "#8B7500" }} />
                    <span
                      className="font-semibold"
                      style={{ color: "#8B7500" }}
                    >
                      Gold Price: Rs. {goldPrice.pricePerTola?.toLocaleString()}{" "}
                      per tola
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-1/4">
            <div className="card sticky top-24">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-xl font-display font-semibold flex items-center"
                    style={{ color: "var(--dark-gray)" }}
                  >
                    <Filter size={18} className="mr-2" />
                    Filters
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm hover:underline"
                    style={{ color: "var(--saffron)" }}
                  >
                    Clear All
                  </button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-6">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--dark-gray)" }}
                  >
                    Search Products
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name..."
                      className="input-field pr-10"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <Search
                        size={16}
                        style={{ color: "var(--stone-gray)" }}
                      />
                    </button>
                  </div>
                </form>

                {/* Categories */}
                <div className="mb-6">
                  <h4
                    className="font-semibold mb-3"
                    style={{ color: "var(--dark-gray)" }}
                  >
                    Categories
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === ""}
                        onChange={() => handleCategoryFilter("")}
                        className="mr-3"
                      />
                      <span style={{ color: "var(--stone-gray)" }}>
                        All Categories
                      </span>
                    </label>
                    {categories.map((category) => (
                      <label
                        key={category._id}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === category.name}
                          onChange={() => handleCategoryFilter(category.name)}
                          className="mr-3"
                        />
                        <span style={{ color: "var(--stone-gray)" }}>
                          {category.name}
                          {category.productCount !== undefined && (
                            <span
                              className="ml-2 text-xs"
                              style={{ color: "var(--saffron)" }}
                            >
                              ({category.productCount})
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4
                    className="font-semibold mb-3"
                    style={{ color: "var(--dark-gray)" }}
                  >
                    Price Range
                  </h4>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange((prev) => ({
                          ...prev,
                          min: e.target.value,
                        }))
                      }
                      className="input-field text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange((prev) => ({
                          ...prev,
                          max: e.target.value,
                        }))
                      }
                      className="input-field text-sm"
                    />
                  </div>
                  <button
                    onClick={handleSearch} // Reuse search handler to apply price filter
                    className="btn btn-primary btn-sm mt-2 w-full"
                  >
                    Apply Price Filter
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center space-x-4">
                <span
                  className="text-sm"
                  style={{ color: "var(--stone-gray)" }}
                >
                  Showing {products.length} of {totalProducts} products
                </span>
                {selectedCategory && (
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium text-white flex items-center"
                    style={{ backgroundColor: "var(--saffron)" }}
                  >
                    {selectedCategory}
                    <button
                      onClick={() => handleCategoryFilter("")}
                      className="ml-2 hover:bg-white/20 rounded-full p-1 -mr-1"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field pr-8 appearance-none"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--stone-gray)" }}
                  />
                </div>

                {/* View Toggle */}
                <div
                  className="flex rounded-lg overflow-hidden border"
                  style={{ borderColor: "var(--light-gray)" }}
                >
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 transition-colors ${
                      viewMode === "grid" ? "text-white" : ""
                    }`}
                    style={{
                      backgroundColor:
                        viewMode === "grid" ? "var(--saffron)" : "white",
                      color:
                        viewMode === "grid" ? "white" : "var(--stone-gray)",
                    }}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 transition-colors ${
                      viewMode === "list" ? "text-white" : ""
                    }`}
                    style={{
                      backgroundColor:
                        viewMode === "list" ? "var(--saffron)" : "white",
                      color:
                        viewMode === "list" ? "white" : "var(--stone-gray)",
                    }}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="spinner mb-4"></div>
                <p style={{ color: "var(--stone-gray)" }}>
                  Filtering products...
                </p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div
                  className={`transition-all ${
                    viewMode === "grid"
                      ? "grid md:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "space-y-4"
                  }`}
                >
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className={`card group ${
                        viewMode === "list" ? "flex flex-col sm:flex-row" : ""
                      }`}
                    >
                      <div
                        className={`relative overflow-hidden ${
                          viewMode === "list"
                            ? "w-full sm:w-48 flex-shrink-0"
                            : ""
                        }`}
                      >
                        <img
                          src={
                            product.imageUrl ||
                            "https://via.placeholder.com/300x300?text=Product"
                          }
                          alt={product.title}
                          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                            viewMode === "list"
                              ? "w-full h-full"
                              : "w-full h-64"
                          }`}
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

                      <div
                        className={`card-body flex flex-col justify-between ${
                          viewMode === "list" ? "flex-1" : ""
                        }`}
                      >
                        <div>
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
                          {viewMode === "list" && product.description && (
                            <p
                              className="text-sm mb-3 line-clamp-2"
                              style={{ color: "var(--stone-gray)" }}
                            >
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div
                          className={`flex items-center mt-2 ${
                            viewMode === "list"
                              ? "justify-between"
                              : "justify-between"
                          }`}
                        >
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
                        {viewMode === "list" && (
                          <div className="flex space-x-2 mt-3">
                            <Link
                              to={`/product/${product._id}`}
                              className="btn btn-primary btn-sm flex-1"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => addToCart(product)}
                              className="btn btn-golden btn-sm flex-1"
                            >
                              Add to Cart
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="btn btn-secondary btn-sm disabled:opacity-50"
                    >
                      Previous
                    </button>

                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--stone-gray)" }}
                    >
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="btn btn-secondary btn-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div
                  className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--cream)" }}
                >
                  <Search size={32} style={{ color: "var(--stone-gray)" }} />
                </div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: "var(--dark-gray)" }}
                >
                  No products found
                </h3>
                <p className="mb-4" style={{ color: "var(--stone-gray)" }}>
                  Try adjusting your filters or search terms.
                </p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
