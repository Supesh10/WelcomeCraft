import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Phone, Mail, MapPin, MessageCircle, ArrowLeft, CheckCircle, AlertCircle, Lock, Edit, Package } from "lucide-react";
import ApiService from "../services/apiService";
import { fallbackToPlaceholder, formatRs, isSilver, productImage } from "../lib/productDisplay";
import { specSummary } from "./CartPage";

const EMPTY_INFO = { name: "", phone: "", email: "", address: "", orderNotes: "" };

function Field({ label, error, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: "var(--dark-gray)" }}>
        {label}
      </label>
      <div className="relative">
        {children}
        {Icon && <Icon size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [placedOrder, setPlacedOrder] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(EMPTY_INFO);

  const sessionId = ApiService.getSessionId();

  useEffect(() => {
    ApiService.getCart(sessionId)
      .then(({ cart: data }) => {
        setCart(data);
        // Pre-fill details saved from an earlier checkout
        setCustomerInfo({
          name: data.customerName || "",
          phone: data.customerPhone || "",
          email: data.customerEmail || "",
          address: data.customerAddress || "",
          orderNotes: data.orderNotes || "",
        });
      })
      .catch(() => setError("Failed to load your cart. Please check your connection and try again."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) setValidationErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!customerInfo.name.trim()) errors.name = "Name is required";
    const digits = customerInfo.phone.replace(/[^\d]/g, "");
    if (!customerInfo.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-()]+$/.test(customerInfo.phone.trim()) || digits.length < 7 || digits.length > 15)
      errors.phone = "Please enter a valid phone number";
    if (customerInfo.email && !/^\S+@\S+\.\S+$/.test(customerInfo.email)) errors.email = "Please enter a valid email address";
    if (!customerInfo.address.trim()) errors.address = "Delivery address is required";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError("Please fill in the required fields.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await ApiService.updateCustomerInfo(sessionId, {
        name: customerInfo.name.trim(),
        phone: customerInfo.phone.trim(),
        email: customerInfo.email.trim(),
        address: customerInfo.address.trim(),
        orderNotes: customerInfo.orderNotes.trim(),
      });
      const result = await ApiService.placeOrder(sessionId);
      setPlacedOrder(result);
      window.dispatchEvent(new Event("storage")); // Cart is now empty
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err.message || "Failed to place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p style={{ color: "var(--stone-gray)" }}>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (placedOrder) {
    const refs = (placedOrder.orderSummary?.orderIds || []).map((id) => String(id).slice(-6).toUpperCase());
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--cream)" }}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4" style={{ color: "var(--dark-gray)" }}>
            Order Received!
          </h1>
          <p className="mb-2" style={{ color: "var(--stone-gray)" }}>
            Thank you, {placedOrder.orderSummary?.customerName}. We'll contact you on {placedOrder.orderSummary?.customerPhone} to
            confirm availability, the final price and delivery.
          </p>
          {refs.length > 0 && (
            <p className="mb-6 text-sm" style={{ color: "var(--stone-gray)" }}>
              Order reference: <strong>{refs.join(", ")}</strong>
            </p>
          )}
          <div className="space-y-3">
            {placedOrder.whatsappUrl && (
              <a href={placedOrder.whatsappUrl} target="_blank" rel="noreferrer" className="btn btn-primary w-full">
                <MessageCircle size={20} className="mr-2" />
                Send order details on WhatsApp
              </a>
            )}
            <Link to="/products" className="btn btn-secondary w-full">
              <Package size={20} className="mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items = (cart?.items || []).filter((i) => i.product);

  if (!cart || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--cream)" }}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingCart size={32} style={{ color: "var(--stone-gray)" }} />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4" style={{ color: "var(--dark-gray)" }}>
            {error ? "Something went wrong" : "Your cart is empty"}
          </h1>
          <p className="mb-6" style={{ color: "var(--stone-gray)" }}>
            {error || "Add some items before checking out."}
          </p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const hasSilver = items.some((i) => isSilver(i.product));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/cart")} className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
            Cart
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold" style={{ color: "var(--dark-gray)" }}>
              Checkout
            </h1>
            <p className="text-sm" style={{ color: "var(--stone-gray)" }}>
              Tell us where to reach you and deliver
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={placeOrder} noValidate className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="card-body space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <User size={24} style={{ color: "var(--saffron)" }} />
                  <h2 className="text-xl font-semibold" style={{ color: "var(--dark-gray)" }}>
                    Your details
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Full name *" error={validationErrors.name} icon={User}>
                    <input
                      type="text"
                      autoComplete="name"
                      value={customerInfo.name}
                      onChange={handleInputChange("name")}
                      className={`input-field w-full pl-10 ${validationErrors.name ? "border-red-500" : ""}`}
                      placeholder="Your full name"
                    />
                  </Field>
                  <Field label="Phone number *" error={validationErrors.phone} icon={Phone}>
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={customerInfo.phone}
                      onChange={handleInputChange("phone")}
                      className={`input-field w-full pl-10 ${validationErrors.phone ? "border-red-500" : ""}`}
                      placeholder="98XXXXXXXX"
                    />
                  </Field>
                </div>

                <Field label="Email (optional)" error={validationErrors.email} icon={Mail}>
                  <input
                    type="email"
                    autoComplete="email"
                    value={customerInfo.email}
                    onChange={handleInputChange("email")}
                    className={`input-field w-full pl-10 ${validationErrors.email ? "border-red-500" : ""}`}
                    placeholder="you@example.com"
                  />
                </Field>

                <Field label="Delivery address *" error={validationErrors.address} icon={MapPin}>
                  <textarea
                    autoComplete="street-address"
                    value={customerInfo.address}
                    onChange={handleInputChange("address")}
                    rows={3}
                    className={`input-field w-full pl-10 resize-none ${validationErrors.address ? "border-red-500" : ""}`}
                    placeholder="Street, city, district"
                  />
                </Field>

                <Field label="Special instructions (optional)">
                  <textarea
                    value={customerInfo.orderNotes}
                    onChange={handleInputChange("orderNotes")}
                    rows={3}
                    className="input-field w-full resize-none"
                    placeholder="Delivery times, gift wrapping, anything else"
                  />
                </Field>
              </div>
            </div>

            <div className="card">
              <div className="card-body flex items-start gap-3">
                <Lock size={20} style={{ color: "var(--saffron)" }} className="flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium mb-2" style={{ color: "var(--dark-gray)" }}>
                    No online payment
                  </h3>
                  <p className="text-sm" style={{ color: "var(--stone-gray)" }}>
                    Your order is sent to our team, who will contact you to confirm the details and final price and arrange payment
                    and delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card lg:sticky lg:top-24">
              <div className="card-body">
                <h3 className="font-semibold text-lg mb-4" style={{ color: "var(--dark-gray)" }}>
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <img
                        src={productImage(item.product)}
                        alt={item.product.title}
                        onError={fallbackToPlaceholder}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate" style={{ color: "var(--dark-gray)" }}>
                          {item.product.title}
                        </h4>
                        {specSummary(item.customSpecification)
                          .slice(0, 2)
                          .map((line) => (
                            <p key={line} className="text-xs" style={{ color: "var(--stone-gray)" }}>
                              {line}
                            </p>
                          ))}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs" style={{ color: "var(--stone-gray)" }}>
                            Qty: {item.quantity}
                          </span>
                          <span className="text-sm font-medium" style={{ color: "var(--saffron)" }}>
                            {formatRs(item.priceSnapshot * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span style={{ color: "var(--dark-gray)" }}>Estimated total</span>
                    <span style={{ color: "var(--saffron)" }}>{formatRs(cart.subtotal)}</span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--stone-gray)" }}>
                    {hasSilver ? "Silver prices use today's rate. " : ""}The final price is confirmed when we contact you.
                  </p>
                </div>

                <button type="submit" disabled={submitting} className="btn btn-primary w-full mt-6">
                  {submitting ? "Placing order..." : "Place Order"}
                </button>

                <Link to="/cart" className="btn btn-secondary btn-sm w-full mt-3">
                  <Edit size={16} className="mr-2" />
                  Edit Cart
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
