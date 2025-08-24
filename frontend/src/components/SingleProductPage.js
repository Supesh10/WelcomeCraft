import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  MessageCircle,
  Star,
  Package,
  Truck,
  Shield,
  Heart,
  Share2,
  Eye,
  Minus,
  Plus,
  AlertCircle,
  CheckCircle,
  Info,
  TrendingUp,
} from "lucide-react";
import ApiService from "../services/apiService";

const SingleProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [silverPrice, setSilverPrice] = useState(null);
  const [goldPrice, setGoldPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  const sessionId = ApiService.getSessionId();

  // Fetch product data
  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productResponse, silverPriceResponse, goldPriceResponse] =
        await Promise.allSettled([
          ApiService.getProductById(id),
          ApiService.getTodaysSilverPrice(),
          ApiService.getTodaysGoldPrice(),
        ]);

      // Handle product
      if (productResponse.status === "fulfilled") {
        const productData = productResponse.value;
        setProduct(productData);

        // Fetch related products from same category
        if (productData.category) {
          try {
            const relatedResponse = await ApiService.getAllProducts({
              categoryName: productData.category.name,
              limit: 4,
            });
            const filtered =
              relatedResponse.products?.filter((p) => p._id !== id) || [];
            setRelatedProducts(filtered.slice(0, 3));
          } catch (err) {
            console.error("Failed to fetch related products:", err);
          }
        }
      } else {
        setError("Product not found");
        return;
      }

      // Handle prices
      if (silverPriceResponse.status === "fulfilled") {
        setSilverPrice(silverPriceResponse.value);
      }
      if (goldPriceResponse.status === "fulfilled") {
        setGoldPrice(goldPriceResponse.value);
      }
    } catch (err) {
      console.error("Failed to fetch product:", err);
      setError("Failed to load product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate current price
  const calculatePrice = () => {
    if (!product) return "Price on request";

    if (product.constantPrice) {
      return `Rs. ${(product.constantPrice * quantity).toLocaleString()}`;
    }

    if (silverPrice && product.weightInTola && product.makingCost) {
      const totalPrice =
        (silverPrice.pricePerTola * product.weightInTola + product.makingCost) *
        quantity;
      return `Rs. ${Math.round(totalPrice).toLocaleString()}`;
    }

    return "Price on request";
  };

  // Add to cart
  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      setError("");

      await ApiService.addToCart(
        sessionId,
        product._id,
        quantity,
        customization || null
      );

      setSuccess("Product added to cart successfully!");
      window.dispatchEvent(new Event("storage")); // Update navbar cart count

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setError("Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  // Buy now (direct to checkout)
  const handleBuyNow = async () => {
    try {
      setAddingToCart(true);
      await ApiService.addToCart(
        sessionId,
        product._id,
        quantity,
        customization || null
      );
      navigate("/checkout");
    } catch (err) {
      console.error("Failed to buy now:", err);
      setError("Failed to process order. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  // Share product
  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this ${product.title} at Welcome Craft`,
          url: window.location.href,
        });
      } catch (err) {
        // Fall back to copying URL
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setSuccess("Product URL copied to clipboard!");
      setTimeout(() => setSuccess(""), 2000);
    });
  };

  useEffect(() => {
    if (id) {
      fetchProductData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p style={{ color: "var(--stone-gray)" }}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--dark-gray)" }}
          >
            Product Not Found
          </h1>
          <p className="mb-6" style={{ color: "var(--stone-gray)" }}>
            {error}
          </p>
          <div className="space-y-3">
            <Link to="/products" className="btn btn-primary block">
              Browse All Products
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="btn btn-secondary block"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link
            to="/"
            className="hover:underline"
            style={{ color: "var(--stone-gray)" }}
          >
            Home
          </Link>
          <span style={{ color: "var(--stone-gray)" }}>/</span>
          <Link
            to="/products"
            className="hover:underline"
            style={{ color: "var(--stone-gray)" }}
          >
            Products
          </Link>
          <span style={{ color: "var(--stone-gray)" }}>/</span>
          <span style={{ color: "var(--dark-gray)" }}>{product.title}</span>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-600">{success}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="aspect-square">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Additional images would go here if product had multiple images */}
            {product.additionalImages &&
              product.additionalImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.additionalImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index + 1)}
                      className={`card overflow-hidden ${
                        selectedImage === index + 1 ? "ring-2 ring-saffron" : ""
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title and Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: "var(--light-saffron)",
                    color: "var(--saffron)",
                  }}
                >
                  {product.category?.name}
                </span>
                {product.category?.name.includes("Silver") && (
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded-full flex items-center gap-1">
                    <TrendingUp size={12} />
                    Live Price
                  </span>
                )}
              </div>
              <h1
                className="text-3xl font-display font-bold"
                style={{ color: "var(--dark-gray)" }}
              >
                {product.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <span
                  className="text-sm"
                  style={{ color: "var(--stone-gray)" }}
                >
                  (4.8 rating)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: "var(--saffron)" }}
                  >
                    {calculatePrice()}
                  </p>
                  {product.weightInTola && (
                    <p
                      className="text-sm"
                      style={{ color: "var(--stone-gray)" }}
                    >
                      Weight: {product.weightInTola} tola
                    </p>
                  )}
                  {silverPrice && product.category?.name.includes("Silver") && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--stone-gray)" }}
                    >
                      Silver rate: Rs.{" "}
                      {silverPrice.pricePerTola?.toLocaleString()}/tola
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <button
                    onClick={handleShare}
                    className="btn btn-ghost btn-sm"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--dark-gray)" }}
              >
                Description
              </h3>
              <p
                className="leading-relaxed"
                style={{ color: "var(--stone-gray)" }}
              >
                {product.description}
              </p>
            </div>

            {/* Product Specifications */}
            <div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--dark-gray)" }}
              >
                Specifications
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: "var(--stone-gray)" }}>Category:</span>
                  <span style={{ color: "var(--dark-gray)" }}>
                    {product.category?.name}
                  </span>
                </div>
                {product.weightInTola && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--stone-gray)" }}>Weight:</span>
                    <span style={{ color: "var(--dark-gray)" }}>
                      {product.weightInTola} tola
                    </span>
                  </div>
                )}
                {product.height && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--stone-gray)" }}>Height:</span>
                    <span style={{ color: "var(--dark-gray)" }}>
                      {product.height}
                    </span>
                  </div>
                )}
                {product.makingCost && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--stone-gray)" }}>
                      Making Cost:
                    </span>
                    <span style={{ color: "var(--dark-gray)" }}>
                      Rs. {product.makingCost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selection */}
            <div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--dark-gray)" }}
              >
                Quantity
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-3 font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span
                  className="text-sm"
                  style={{ color: "var(--stone-gray)" }}
                >
                  Total: {calculatePrice()}
                </span>
              </div>
            </div>

            {/* Customization */}
            {product.isCustomizable && (
              <div>
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ color: "var(--dark-gray)" }}
                >
                  Customization
                </h3>
                <textarea
                  value={customization}
                  onChange={(e) => setCustomization(e.target.value)}
                  placeholder="Add your customization requirements..."
                  rows={4}
                  className="input-field w-full resize-none"
                />
                <p
                  className="text-xs mt-2"
                  style={{ color: "var(--stone-gray)" }}
                >
                  Describe any specific requirements or modifications you'd like
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="btn btn-secondary"
                >
                  {addingToCart ? (
                    <>
                      <div className="spinner-sm mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} className="mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={addingToCart}
                  className="btn btn-primary"
                >
                  {addingToCart ? (
                    <>
                      <div className="spinner-sm mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <MessageCircle size={20} className="mr-2" />
                      Buy Now
                    </>
                  )}
                </button>
              </div>

              {/* WhatsApp Direct Contact */}
              <button
                onClick={() => {
                  const message = `Hi! I'm interested in ${product.title}. Could you provide more details?`;
                  const whatsappUrl = `https://wa.me/${
                    process.env.REACT_APP_WHATSAPP_NUMBER
                  }?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, "_blank");
                }}
                className="btn btn-outline w-full text-green-600 border-green-600 hover:bg-green-600"
              >
                <MessageCircle size={20} className="mr-2" />
                Chat on WhatsApp
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield size={20} className="text-blue-600" />
                </div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--dark-gray)" }}
                >
                  Authentic
                </p>
                <p className="text-xs" style={{ color: "var(--stone-gray)" }}>
                  Genuine products
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                  <Truck size={20} className="text-green-600" />
                </div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--dark-gray)" }}
                >
                  Safe Delivery
                </p>
                <p className="text-xs" style={{ color: "var(--stone-gray)" }}>
                  Secure packaging
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center">
                  <MessageCircle size={20} className="text-purple-600" />
                </div>
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--dark-gray)" }}
                >
                  Direct Contact
                </p>
                <p className="text-xs" style={{ color: "var(--stone-gray)" }}>
                  Personal service
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2
                className="text-2xl font-display font-bold"
                style={{ color: "var(--dark-gray)" }}
              >
                Related Products
              </h2>
              <Link to="/products" className="btn btn-secondary btn-sm">
                View All
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  to={`/product/${relatedProduct._id}`}
                  className="card group cursor-pointer"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        relatedProduct.imageUrl || "/api/placeholder/300/300"
                      }
                      alt={relatedProduct.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                  </div>
                  <div className="card-body">
                    <h3
                      className="font-semibold mb-1 truncate"
                      style={{ color: "var(--dark-gray)" }}
                    >
                      {relatedProduct.title}
                    </h3>
                    <p
                      className="text-sm mb-2"
                      style={{ color: "var(--stone-gray)" }}
                    >
                      {relatedProduct.category?.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="font-bold"
                        style={{ color: "var(--saffron)" }}
                      >
                        {relatedProduct.constantPrice
                          ? `Rs. ${relatedProduct.constantPrice.toLocaleString()}`
                          : "Live pricing"}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className="text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleProductPage;
