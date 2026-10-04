import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  MessageCircle,
  Truck,
  Shield,
  Share2,
  Minus,
  Plus,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Clock,
} from "lucide-react";
import ApiService from "../services/apiService";
import { SHOP } from "../lib/shopInfo";
import {
  CustomPieceFields,
  EMPTY_SPEC,
  estimateCustomPrice,
  validateCustomPiece,
  valuesToSpec,
} from "./CustomPieceForm";
import {
  fallbackToPlaceholder,
  formatRs,
  isCustomSilver,
  isSilver,
  label,
  priceLabel,
  productImage,
  productImages,
  variantLabel,
} from "../lib/productDisplay";

const WHATSAPP_PHONE = SHOP.whatsapp;

const SpecRow = ({ name, value }) =>
  value == null || value === "" ? null : (
    <div className="flex justify-between gap-4">
      <span style={{ color: "var(--stone-gray)" }}>{name}</span>
      <span className="text-right" style={{ color: "var(--dark-gray)" }}>
        {value}
      </span>
    </div>
  );

const SingleProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [spec, setSpec] = useState(EMPTY_SPEC);
  const [specErrors, setSpecErrors] = useState({});
  // Bumped to reset the custom form (and its design dropdown)
  const [specFormKey, setSpecFormKey] = useState(0);

  const sessionId = ApiService.getSessionId();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      setSelectedImage(0);
      setQuantity(1);
      setSpec(EMPTY_SPEC);
      setSpecErrors({});
      try {
        const { product: data } = await ApiService.getProductById(id);
        if (cancelled) return;
        setProduct(data);
        setSpecFormKey((k) => k + 1);

        const categoryId = data.category?._id;
        if (categoryId) {
          ApiService.getAllProducts({ category: categoryId, limit: 4 })
            .then((res) => {
              if (!cancelled) setRelatedProducts((res.products || []).filter((p) => p._id !== id).slice(0, 3));
            })
            .catch(() => {});
        }
      } catch (err) {
        if (!cancelled) setError(err.status === 404 ? "This product doesn't exist." : "Failed to load product. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const custom = isCustomSilver(product);
  const images = productImages(product);
  const options = product?.customOptions || {};
  const silverRate = product?.pricing?.silverRate;

  // Unit price: fixed / stock silver from the API, custom silver from the chosen weight
  const unitPrice = useMemo(() => {
    if (!product) return null;
    if (custom) return estimateCustomPrice(product, spec, silverRate);
    return product.pricing?.price ?? product.constantPrice ?? null;
  }, [product, custom, spec, silverRate]);

  const setSpecField = (field, value) => {
    setSpec((s) => ({ ...s, [field]: value }));
    setSpecErrors((er) => ({ ...er, [field]: undefined }));
  };

  function validateSpec() {
    if (!custom) return true;
    const e = validateCustomPiece(product, spec);
    setSpecErrors(e);
    return Object.keys(e).length === 0;
  }

  const buildSpec = () => (custom ? valuesToSpec(spec) : undefined);

  async function addToCart() {
    setError("");
    if (!validateSpec()) {
      setError("Please complete the custom order details below.");
      return false;
    }
    try {
      setAddingToCart(true);
      await ApiService.addToCart(sessionId, product._id, quantity, { customSpecification: buildSpec() });
      window.dispatchEvent(new Event("storage")); // Update navbar cart count
      return true;
    } catch (err) {
      const details = Array.isArray(err.details) ? `: ${err.details.join(", ")}` : "";
      setError(`${err.message || "Failed to add to cart"}${details}`);
      return false;
    } finally {
      setAddingToCart(false);
    }
  }

  const handleAddToCart = async () => {
    if (await addToCart()) {
      setSuccess(custom ? "Your custom order was added to the cart." : "Added to cart.");
      if (custom) {
        setSpec(EMPTY_SPEC);
        setSpecFormKey((k) => k + 1);
      }
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleBuyNow = async () => {
    if (await addToCart()) navigate("/checkout");
  };

  const handleShare = async () => {
    const copy = () =>
      navigator.clipboard?.writeText(window.location.href).then(() => {
        setSuccess("Product link copied to clipboard!");
        setTimeout(() => setSuccess(""), 2000);
      });
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, url: window.location.href });
      } catch {
        copy();
      }
    } else {
      copy();
    }
  };

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

  if (!product || product.isActive === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--dark-gray)" }}>
            Product Not Available
          </h1>
          <p className="mb-6" style={{ color: "var(--stone-gray)" }}>
            {error || "This product is no longer available."}
          </p>
          <Link to="/products" className="btn btn-primary">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const dims = product.dimensions || {};
  const dimensionText = [dims.height && `H ${dims.height}`, dims.width && `W ${dims.width}`, dims.length && `L ${dims.length}`]
    .filter(Boolean)
    .join(" × ");
  const mainImage = images[selectedImage] || productImage(product);
  const time = options.productionTime;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
          <Link to="/" className="hover:underline" style={{ color: "var(--stone-gray)" }}>
            Home
          </Link>
          <span style={{ color: "var(--stone-gray)" }}>/</span>
          <Link to="/products" className="hover:underline" style={{ color: "var(--stone-gray)" }}>
            Products
          </Link>
          {product.category && (
            <>
              <span style={{ color: "var(--stone-gray)" }}>/</span>
              <Link
                to={`/products?category=${product.category._id}`}
                className="hover:underline"
                style={{ color: "var(--stone-gray)" }}
              >
                {product.category.name}
              </Link>
            </>
          )}
        </div>

        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm mb-6">
          <ArrowLeft size={16} />
          Back
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-700">
              {success}{" "}
              <Link to="/cart" className="underline font-medium">
                View cart
              </Link>
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="aspect-square bg-white">
                <img
                  src={mainImage}
                  alt={product.title}
                  onError={fallbackToPlaceholder}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {images.map((src, index) => (
                  <button
                    key={src}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`Show image ${index + 1}`}
                    className={`card overflow-hidden ${selectedImage === index ? "ring-2 ring-orange-500" : ""}`}
                  >
                    <img
                      src={src}
                      alt=""
                      onError={fallbackToPlaceholder}
                      className="w-full aspect-square object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {product.category && (
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: "var(--light-saffron)", color: "var(--saffron)" }}
                  >
                    {product.category.name}
                  </span>
                )}
                {variantLabel(product) && (
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">{variantLabel(product)}</span>
                )}
                {isSilver(product) && (
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded-full flex items-center gap-1">
                    <TrendingUp size={12} />
                    Live silver price
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-display font-bold" style={{ color: "var(--dark-gray)" }}>
                {product.title}
              </h1>
            </div>

            {/* Price */}
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold" style={{ color: "var(--saffron)" }}>
                    {unitPrice != null
                      ? formatRs(unitPrice * quantity)
                      : custom && product.pricing?.priceRange
                      ? `${formatRs(product.pricing.priceRange.min)} – ${formatRs(product.pricing.priceRange.max)}`
                      : priceLabel(product)}
                  </p>
                  {quantity > 1 && unitPrice != null && (
                    <p className="text-sm" style={{ color: "var(--stone-gray)" }}>
                      {formatRs(unitPrice)} each
                    </p>
                  )}
                  {custom && (
                    <p className="text-sm mt-1" style={{ color: "var(--stone-gray)" }}>
                      {unitPrice != null
                        ? "Estimate for the weight you chose. Final price is confirmed with you."
                        : "Price depends on the weight you choose below."}
                    </p>
                  )}
                  {isSilver(product) && silverRate && (
                    <p className="text-xs mt-1" style={{ color: "var(--stone-gray)" }}>
                      Today's silver rate: {formatRs(silverRate)}/tola + making charge {formatRs(product.makingCost)}
                    </p>
                  )}
                  {isSilver(product) && !silverRate && (
                    <p className="text-xs mt-1 text-orange-600">Today's silver rate isn't available yet; we'll confirm the price.</p>
                  )}
                </div>
                <button onClick={handleShare} className="btn btn-ghost btn-sm" aria-label="Share">
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--dark-gray)" }}>
                Description
              </h3>
              <p className="leading-relaxed whitespace-pre-line" style={{ color: "var(--stone-gray)" }}>
                {product.description}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--dark-gray)" }}>
                Specifications
              </h3>
              <div className="space-y-2">
                <SpecRow name="Category" value={product.category?.name} />
                {product.productType === "gold" && (
                  <>
                    <SpecRow name="Gold finish" value={label(product.goldFinish)} />
                    <SpecRow name="Plating" value={label(product.platingMethod)} />
                    <SpecRow name="Base metal" value={product.baseMetal && label(product.baseMetal)} />
                  </>
                )}
                {product.productType === "metal" && (
                  <>
                    <SpecRow name="Material" value={product.metal && product.metal[0].toUpperCase() + product.metal.slice(1)} />
                    <SpecRow name="Finish" value={product.finish} />
                  </>
                )}
                {isSilver(product) && !custom && <SpecRow name="Weight" value={product.weightInTola && `${product.weightInTola} tola`} />}
                {custom && (
                  <>
                    <SpecRow name="Weight range" value={`${product.weightRange?.min}–${product.weightRange?.max} tola`} />
                    {options.sizeRange && (options.sizeRange.minHeight != null || options.sizeRange.maxHeight != null) && (
                      <SpecRow
                        name="Height range"
                        value={`${options.sizeRange.minHeight ?? "—"}–${options.sizeRange.maxHeight ?? "—"} ${options.sizeRange.unit || "inch"}`}
                      />
                    )}
                    {time && <SpecRow name="Production time" value={`${time.minDays}–${time.maxDays} days`} />}
                  </>
                )}
                <SpecRow name="Weight" value={product.weightInKg && `${product.weightInKg} kg`} />
                <SpecRow name="Dimensions" value={dimensionText && `${dimensionText} ${dims.unit || "inch"}`} />
                {!custom && product.stockQuantity > 0 && <SpecRow name="Availability" value={`${product.stockQuantity} in stock`} />}
              </div>
            </div>

            {/* Custom silver order details */}
            {custom && (
              <div className="p-4 bg-white rounded-lg border space-y-4">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--dark-gray)" }}>
                    Your custom piece
                  </h3>
                  {time && (
                    <p className="text-sm flex items-center gap-1 mt-1" style={{ color: "var(--stone-gray)" }}>
                      <Clock size={14} /> Made to order in {time.minDays}–{time.maxDays} days
                    </p>
                  )}
                </div>

                <CustomPieceFields
                  key={`${product._id}-${specFormKey}`}
                  product={product}
                  values={spec}
                  errors={specErrors}
                  onChange={setSpecField}
                />
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--dark-gray)" }}>
                Quantity
              </h3>
              <div className="flex items-center border rounded-lg w-fit bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="p-3 hover:bg-gray-100 disabled:opacity-50"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-3 font-medium min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity" className="p-3 hover:bg-gray-100">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={handleAddToCart} disabled={addingToCart} className="btn btn-secondary">
                  <ShoppingCart size={20} className="mr-2" />
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>
                <button onClick={handleBuyNow} disabled={addingToCart} className="btn btn-primary">
                  {addingToCart ? "Processing..." : "Buy Now"}
                </button>
              </div>

              {WHATSAPP_PHONE && (
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
                    `Hi! I'm interested in "${product.title}" (${window.location.href}). Could you share more details?`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline w-full text-green-600 border-green-600 hover:bg-green-600"
                >
                  <MessageCircle size={20} className="mr-2" />
                  Ask on WhatsApp
                </a>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              {[
                { Icon: Shield, bg: "bg-blue-100", fg: "text-blue-600", title: "Authentic", text: "Handcrafted in Nepal" },
                { Icon: Truck, bg: "bg-green-100", fg: "text-green-600", title: "Safe Delivery", text: "Secure packaging" },
                { Icon: MessageCircle, bg: "bg-purple-100", fg: "text-purple-600", title: "Direct Contact", text: "Personal service" },
              ].map(({ Icon, bg, fg, title, text }) => (
                <div key={title} className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${bg} flex items-center justify-center`}>
                    <Icon size={20} className={fg} />
                  </div>
                  <p className="text-xs font-medium" style={{ color: "var(--dark-gray)" }}>
                    {title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--stone-gray)" }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold" style={{ color: "var(--dark-gray)" }}>
                More from {product.category?.name}
              </h2>
              <Link to={`/products?category=${product.category?._id}`} className="btn btn-secondary btn-sm">
                View All
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <Link key={p._id} to={`/product/${p._id}`} className="card group cursor-pointer">
                  <div className="relative overflow-hidden">
                    <img
                      src={productImage(p)}
                      alt={p.title}
                      onError={fallbackToPlaceholder}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="card-body">
                    <h3 className="font-semibold mb-1 truncate" style={{ color: "var(--dark-gray)" }}>
                      {p.title}
                    </h3>
                    <p className="text-sm mb-2" style={{ color: "var(--stone-gray)" }}>
                      {variantLabel(p) || p.category?.name}
                    </p>
                    <span className="font-bold" style={{ color: "var(--saffron)" }}>
                      {priceLabel(p)}
                    </span>
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
