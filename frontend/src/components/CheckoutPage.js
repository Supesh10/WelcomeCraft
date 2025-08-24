import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Lock,
  Edit,
  Package,
} from "lucide-react";
import ApiService from "../services/apiService";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Customer form data
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    orderNotes: "",
  });

  const sessionId = ApiService.getSessionId();

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ApiService.getCart(sessionId);

      if (!response || !response.items || response.items.length === 0) {
        navigate("/cart");
        return;
      }

      setCart(response);

      // Pre-fill customer info if already exists in cart
      if (response.customerName) {
        setCustomerInfo({
          name: response.customerName || "",
          phone: response.customerPhone || "",
          email: response.customerEmail || "",
          address: response.customerAddress || "",
          orderNotes: response.orderNotes || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError("Failed to load cart data. Please try again.");
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!customerInfo.name.trim()) {
      errors.name = "Name is required";
    }

    if (!customerInfo.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(customerInfo.phone.trim())) {
      errors.phone = "Please enter a valid phone number";
    }

    if (customerInfo.email && !/\S+@\S+\.\S+/.test(customerInfo.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!customerInfo.address.trim()) {
      errors.address = "Address is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update customer info in cart
  const updateCustomerInfo = async () => {
    try {
      await ApiService.updateCustomerInfo(sessionId, customerInfo);
      return true;
    } catch (err) {
      console.error("Failed to update customer info:", err);
      setError("Failed to save customer information. Please try again.");
      return false;
    }
  };

  // Generate WhatsApp message
  const generateWhatsAppMessage = () => {
    let message = `🛒 *New Order from Welcome Craft Website*\n\n`;

    // Customer details
    message += `👤 *Customer Details:*\n`;
    message += `Name: ${customerInfo.name}\n`;
    message += `Phone: ${customerInfo.phone}\n`;
    if (customerInfo.email) message += `Email: ${customerInfo.email}\n`;
    message += `Address: ${customerInfo.address}\n\n`;

    // Order items
    message += `📦 *Order Items:*\n`;
    cart.items.forEach((item, index) => {
      const price =
        item.product.constantPrice ||
        (item.product.weightInTola && item.product.makingCost
          ? "Live pricing applies"
          : `Rs. ${item.priceSnapshot}`);

      message += `${index + 1}. *${item.product.title}*\n`;
      message += `   Category: ${item.product.category?.name}\n`;
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Price: ${
        typeof price === "string" ? price : `Rs. ${price.toLocaleString()}`
      }\n`;

      if (item.customization) {
        message += `   Customization: ${item.customization}\n`;
      }
      message += `\n`;
    });

    // Order summary
    message += `💰 *Order Summary:*\n`;
    message += `Total Items: ${cart.totalItems}\n`;
    message += `Estimated Total: Rs. ${Math.round(
      cart.calculatedTotal || cart.subtotal
    ).toLocaleString()}\n\n`;

    if (customerInfo.orderNotes) {
      message += `📝 *Special Notes:*\n${customerInfo.orderNotes}\n\n`;
    }

    message += `⏰ Order placed on: ${new Date().toLocaleString()}\n`;
    message += `🌐 Order via: Welcome Craft Website\n\n`;
    message += `Please confirm availability and provide final pricing. Thank you! 🙏`;

    return encodeURIComponent(message);
  };

  // Place order
  const placeOrder = async () => {
    if (!validateForm()) {
      setError("Please fill in all required fields correctly.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Update customer info in cart
      const updated = await updateCustomerInfo();
      if (!updated) return;

      // Generate WhatsApp URL
      const whatsappMessage = generateWhatsAppMessage();
      const whatsappNumber = process.env.WHATSAPP_NUMBER; // Replace with actual number
      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(
        /[^\d]/g,
        ""
      )}?text=${whatsappMessage}`;

      // Mark order as placed (you could also create an order record here)
      setOrderPlaced(true);

      // Clear cart after successful order
      setTimeout(async () => {
        try {
          await ApiService.clearCart(sessionId);
          window.dispatchEvent(new Event("storage")); // Update navbar cart count
        } catch (err) {
          console.error("Failed to clear cart:", err);
        }
      }, 1000);

      // Open WhatsApp
      window.open(whatsappUrl, "_blank");
    } catch (err) {
      console.error("Failed to place order:", err);
      setError("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

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

  if (orderPlaced) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--cream)" }}
      >
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1
            className="text-3xl font-display font-bold mb-4"
            style={{ color: "var(--dark-gray)" }}
          >
            Order Submitted!
          </h1>
          <p className="mb-6" style={{ color: "var(--stone-gray)" }}>
            Your order has been sent via WhatsApp. Our team will contact you
            shortly to confirm availability and provide final pricing.
          </p>
          <div className="space-y-3">
            <Link to="/products" className="btn btn-primary block">
              <Package size={20} className="mr-2" />
              Continue Shopping
            </Link>
            <Link to="/" className="btn btn-secondary block">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--cream)" }}
      >
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingCart size={32} style={{ color: "var(--stone-gray)" }} />
          </div>
          <h1
            className="text-3xl font-display font-bold mb-4"
            style={{ color: "var(--dark-gray)" }}
          >
            Cart is Empty
          </h1>
          <p className="mb-6" style={{ color: "var(--stone-gray)" }}>
            Your cart is empty. Please add some items before proceeding to
            checkout.
          </p>
          <div className="space-y-3">
            <Link to="/products" className="btn btn-primary block">
              Browse Products
            </Link>
            <Link to="/" className="btn btn-secondary block">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft size={16} />
            Back to Cart
          </button>
          <div>
            <h1
              className="text-3xl font-display font-bold"
              style={{ color: "var(--dark-gray)" }}
            >
              Checkout
            </h1>
            <p className="text-sm" style={{ color: "var(--stone-gray)" }}>
              Complete your order details
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 text-sm mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Customer Information Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center gap-3 mb-6">
                  <User size={24} style={{ color: "var(--saffron)" }} />
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: "var(--dark-gray)" }}
                  >
                    Customer Information
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--dark-gray)" }}
                    >
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className={`input-field pl-10 ${
                          validationErrors.name ? "border-red-500" : ""
                        }`}
                        placeholder="Enter your full name"
                      />
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                    </div>
                    {validationErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--dark-gray)" }}
                    >
                      Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className={`input-field pl-10 ${
                          validationErrors.phone ? "border-red-500" : ""
                        }`}
                        placeholder="Enter your phone number"
                      />
                      <Phone
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="mt-4">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--dark-gray)" }}
                  >
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`input-field pl-10 ${
                        validationErrors.email ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your email address"
                    />
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="mt-4">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--dark-gray)" }}
                  >
                    Delivery Address *
                  </label>
                  <div className="relative">
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      rows={3}
                      className={`input-field pl-10 resize-none ${
                        validationErrors.address ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your complete address"
                    />
                    <MapPin
                      size={16}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                  </div>
                  {validationErrors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.address}
                    </p>
                  )}
                </div>

                {/* Order Notes */}
                <div className="mt-4">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--dark-gray)" }}
                  >
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={customerInfo.orderNotes}
                    onChange={(e) =>
                      handleInputChange("orderNotes", e.target.value)
                    }
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Any special instructions or requirements for your order"
                  />
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-start gap-3">
                  <Lock
                    size={20}
                    style={{ color: "var(--saffron)" }}
                    className="flex-shrink-0 mt-1"
                  />
                  <div>
                    <h3
                      className="font-medium mb-2"
                      style={{ color: "var(--dark-gray)" }}
                    >
                      Secure Checkout Process
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--stone-gray)" }}
                    >
                      Your order will be processed securely via WhatsApp. Our
                      team will contact you directly to confirm details, provide
                      final pricing, and arrange delivery. No payment is
                      processed online - all transactions are handled personally
                      for your security and convenience.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-body">
                <h3
                  className="font-semibold text-lg mb-4"
                  style={{ color: "var(--dark-gray)" }}
                >
                  Order Summary
                </h3>

                {/* Items List */}
                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <img
                        src={item.product.imageUrl || "/api/placeholder/60/60"}
                        alt={item.product.title}
                        className="w-15 h-15 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4
                          className="font-medium text-sm"
                          style={{ color: "var(--dark-gray)" }}
                        >
                          {item.product.title}
                        </h4>
                        <p
                          className="text-xs"
                          style={{ color: "var(--stone-gray)" }}
                        >
                          {item.product.category?.name}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span
                            className="text-xs"
                            style={{ color: "var(--stone-gray)" }}
                          >
                            Qty: {item.quantity}
                          </span>
                          <span
                            className="text-sm font-medium"
                            style={{ color: "var(--saffron)" }}
                          >
                            {item.product.constantPrice
                              ? `Rs. ${(
                                  item.product.constantPrice * item.quantity
                                ).toLocaleString()}`
                              : "Live pricing"}
                          </span>
                        </div>
                        {item.customization && (
                          <p
                            className="text-xs mt-1 italic"
                            style={{ color: "var(--stone-gray)" }}
                          >
                            Custom: {item.customization.substring(0, 50)}...
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--stone-gray)" }}>
                      Items ({cart.totalItems})
                    </span>
                    <span>
                      Rs.{" "}
                      {Math.round(
                        cart.calculatedTotal || cart.subtotal
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span style={{ color: "var(--dark-gray)" }}>
                      Estimated Total
                    </span>
                    <span style={{ color: "var(--saffron)" }}>
                      Rs.{" "}
                      {Math.round(
                        cart.calculatedTotal || cart.subtotal
                      ).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--stone-gray)" }}>
                    * Final pricing will be confirmed via WhatsApp
                  </p>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={placeOrder}
                  disabled={submitting}
                  className="btn btn-primary w-full mt-6"
                >
                  {submitting ? (
                    <>
                      <div className="spinner-sm mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <MessageCircle size={20} className="mr-2" />
                      Place Order via WhatsApp
                    </>
                  )}
                </button>

                <p
                  className="text-xs text-center mt-3"
                  style={{ color: "var(--stone-gray)" }}
                >
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>
            </div>

            {/* Edit Cart */}
            <div className="card">
              <div className="card-body text-center">
                <h4
                  className="font-medium mb-3"
                  style={{ color: "var(--dark-gray)" }}
                >
                  Need to make changes?
                </h4>
                <Link to="/cart" className="btn btn-secondary btn-sm w-full">
                  <Edit size={16} className="mr-2" />
                  Edit Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
