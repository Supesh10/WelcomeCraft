import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, Edit, Package, CreditCard, ArrowLeft, Info } from "lucide-react";
import ApiService from "../services/apiService";
import { fallbackToPlaceholder, formatRs, isCustomSilver, isSilver, productImage, variantLabel } from "../lib/productDisplay";
import { CustomPieceFields, estimateCustomPrice, specToValues, validateCustomPiece, valuesToSpec } from "./CustomPieceForm";

// Lines describing a custom silver specification
export function specSummary(spec) {
  if (!spec || spec.preferredWeight == null) return [];
  const size = spec.size || {};
  const dims = [size.height, size.width, size.length].filter(Boolean).join(" × ");
  return [
    `Weight: ${spec.preferredWeight} tola`,
    dims && `Size: ${dims} ${size.unit || "inch"}`,
    spec.design && `Design: ${spec.design}`,
    spec.designNotes && `Notes: ${spec.designNotes}`,
    spec.requiredBy && `Needed by: ${new Date(spec.requiredBy).toLocaleDateString()}`,
    spec.estimatedCompletion?.latest && `Estimated ready by: ${new Date(spec.estimatedCompletion.latest).toLocaleDateString()}`,
  ].filter(Boolean);
}

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [error, setError] = useState(null);
  const [notices, setNotices] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [noteText, setNoteText] = useState("");
  // Custom piece being edited: { itemId, values, errors, saving, error }
  const [specEdit, setSpecEdit] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const sessionId = ApiService.getSessionId();

  const applyResponse = (res) => {
    setCart(res.cart);
    const msgs = [];
    if (res.priceChanges?.length) msgs.push("Some prices were updated to today's silver rate.");
    if (res.removedItems?.length) msgs.push(`Removed because no longer available: ${res.removedItems.join(", ")}.`);
    if (msgs.length) setNotices(msgs);
    window.dispatchEvent(new Event("storage")); // Update navbar cart count
  };

  const fetchCart = useCallback(async () => {
    try {
      setError(null);
      applyResponse(await ApiService.getCart(sessionId));
    } catch (err) {
      setError("Failed to load your cart. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const runItemUpdate = async (itemId, request) => {
    try {
      setUpdating((u) => ({ ...u, [itemId]: true }));
      setError(null);
      const res = await request();
      if (res?.cart) {
        setCart(res.cart);
        window.dispatchEvent(new Event("storage"));
      } else {
        await fetchCart();
      }
    } catch (err) {
      setError(err.message || "Failed to update your cart. Please try again.");
    } finally {
      setUpdating((u) => ({ ...u, [itemId]: false }));
    }
  };

  const updateQuantity = (item, quantity) => {
    if (quantity < 1) return;
    runItemUpdate(item._id, () => ApiService.updateCartItem(sessionId, item._id, { quantity }));
  };

  const removeItem = (item) => runItemUpdate(item._id, () => ApiService.removeFromCart(sessionId, item._id));

  const saveNote = (item) =>
    runItemUpdate(item._id, () => ApiService.updateCartItem(sessionId, item._id, { customization: noteText.trim() })).then(() => {
      setEditingItem(null);
      setNoteText("");
    });

  const startSpecEdit = (item) =>
    setSpecEdit({ itemId: item._id, values: specToValues(item.customSpecification), errors: {}, error: "", saving: false });

  // Checkout links here with ?edit=<itemId> to open that item's editor
  const editParam = searchParams.get("edit");
  useEffect(() => {
    if (!editParam || !cart) return;
    const item = cart.items.find((i) => i._id === editParam && isCustomSilver(i.product));
    if (item) {
      startSpecEdit(item);
      setTimeout(() => document.getElementById(`item-${item._id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    }
    searchParams.delete("edit");
    setSearchParams(searchParams, { replace: true });
  }, [editParam, cart]); // eslint-disable-line react-hooks/exhaustive-deps

  const setSpecField = (field, value) =>
    setSpecEdit((e) => ({ ...e, values: { ...e.values, [field]: value }, errors: { ...e.errors, [field]: undefined }, error: "" }));

  const saveSpec = async (item) => {
    const errors = validateCustomPiece(item.product, specEdit.values);
    if (Object.keys(errors).length) {
      setSpecEdit((e) => ({ ...e, errors }));
      return;
    }
    setSpecEdit((e) => ({ ...e, saving: true, error: "" }));
    try {
      const res = await ApiService.updateCartItem(sessionId, item._id, { customSpecification: valuesToSpec(specEdit.values) });
      setCart(res.cart);
      setSpecEdit(null);
      setNotices([`Updated the details for ${item.product.title}.`]);
    } catch (err) {
      const details = Array.isArray(err.details) ? `: ${err.details.join(", ")}` : "";
      setSpecEdit((e) => ({ ...e, saving: false, error: `${err.message || "Couldn't save the changes"}${details}` }));
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Remove all items from your cart?")) return;
    try {
      setLoading(true);
      await ApiService.clearCart(sessionId);
      await fetchCart();
    } catch (err) {
      setError("Failed to clear the cart. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p style={{ color: "var(--stone-gray)" }}>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <ShoppingCart size={24} className="text-red-600" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchCart} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const items = (cart?.items || []).filter((i) => i.product);

  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
        <div className="container mx-auto px-6 py-12">
          <div className="text-center max-w-md mx-auto">
            {notices.map((n) => (
              <p key={n} className="mb-4 text-sm text-orange-700">
                {n}
              </p>
            ))}
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingCart size={32} style={{ color: "var(--stone-gray)" }} />
            </div>
            <h1 className="text-3xl font-display font-bold mb-4" style={{ color: "var(--dark-gray)" }}>
              Your Cart is Empty
            </h1>
            <p className="mb-8" style={{ color: "var(--stone-gray)" }}>
              Explore our collection of handcrafted Buddhist statues and ornaments.
            </p>
            <Link to="/products" className="btn btn-primary">
              <Package size={20} className="mr-2" />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasSilver = items.some((i) => isSilver(i.product));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">
              <ArrowLeft size={16} />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-display font-bold" style={{ color: "var(--dark-gray)" }}>
                Shopping Cart
              </h1>
              <p className="text-sm" style={{ color: "var(--stone-gray)" }}>
                {cart.totalItems} {cart.totalItems === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button onClick={clearCart} className="btn btn-outline btn-sm text-red-600 border-red-600 hover:bg-red-600 self-start sm:self-auto">
            <Trash2 size={16} />
            Clear Cart
          </button>
        </div>

        {notices.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex gap-3">
            <Info size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-orange-800">
              {notices.map((n) => (
                <p key={n}>{n}</p>
              ))}
            </div>
            <button onClick={() => setNotices([])} className="text-xs underline text-orange-700">
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex justify-between gap-3">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const p = item.product;
              const busy = updating[item._id];
              const specLines = specSummary(item.customSpecification);
              return (
                <div key={item._id} id={`item-${item._id}`} className={`card ${busy ? "opacity-60" : ""}`}>
                  <div className="card-body">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to={`/product/${p._id}`} className="w-full sm:w-32 h-40 sm:h-32 flex-shrink-0">
                        <img
                          src={productImage(p)}
                          alt={p.title}
                          onError={fallbackToPlaceholder}
                          className="w-full h-full object-cover rounded"
                        />
                      </Link>

                      <div className="flex-1 space-y-3 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <Link to={`/product/${p._id}`} className="font-semibold text-lg hover:underline" style={{ color: "var(--dark-gray)" }}>
                              {p.title}
                            </Link>
                            <p className="text-sm" style={{ color: "var(--stone-gray)" }}>
                              {[p.category?.name, variantLabel(p)].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item)}
                            disabled={busy}
                            aria-label={`Remove ${p.title}`}
                            className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {specEdit?.itemId === item._id ? (
                          <div className="border rounded p-3 sm:p-4 space-y-4 bg-white">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Edit custom piece</p>
                            <CustomPieceFields
                              product={p}
                              values={specEdit.values}
                              errors={specEdit.errors}
                              onChange={setSpecField}
                              idPrefix={`item-${item._id}`}
                            />
                            {(() => {
                              const estimate = estimateCustomPrice(p, specEdit.values, item.silverPriceSnapshot);
                              return (
                                estimate != null && (
                                  <p className="text-sm" style={{ color: "var(--stone-gray)" }}>
                                    New price: <strong style={{ color: "var(--saffron)" }}>{formatRs(estimate)}</strong> each
                                    {estimate !== item.priceSnapshot && ` (was ${formatRs(item.priceSnapshot)})`}
                                  </p>
                                )
                              );
                            })()}
                            {specEdit.error && <p className="text-sm text-red-600">{specEdit.error}</p>}
                            <div className="flex gap-2">
                              <button onClick={() => saveSpec(item)} disabled={specEdit.saving} className="btn btn-primary btn-sm">
                                {specEdit.saving ? "Saving..." : "Save details"}
                              </button>
                              <button onClick={() => setSpecEdit(null)} disabled={specEdit.saving} className="btn btn-secondary btn-sm">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          specLines.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded text-sm space-y-0.5" style={{ color: "var(--dark-gray)" }}>
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Custom order</p>
                                <button
                                  onClick={() => startSpecEdit(item)}
                                  className="text-xs flex items-center gap-1 hover:underline"
                                  style={{ color: "var(--saffron)" }}
                                >
                                  <Edit size={12} />
                                  Edit details
                                </button>
                              </div>
                              {specLines.map((line) => (
                                <p key={line}>{line}</p>
                              ))}
                            </div>
                          )
                        )}

                        {editingItem === item._id ? (
                          <div className="space-y-2">
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Anything we should know about this item?"
                              className="input-field w-full h-20 resize-none"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => saveNote(item)} disabled={busy} className="btn btn-primary btn-sm">
                                Save
                              </button>
                              <button onClick={() => setEditingItem(null)} className="btn btn-secondary btn-sm">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingItem(item._id);
                              setNoteText(item.customization || "");
                            }}
                            className="text-sm flex items-center gap-1 hover:underline text-left"
                            style={{ color: "var(--stone-gray)" }}
                          >
                            <Edit size={14} />
                            {item.customization ? `Note: ${item.customization}` : "Add a note"}
                          </button>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center border rounded bg-white">
                            <button
                              onClick={() => updateQuantity(item, item.quantity - 1)}
                              disabled={item.quantity <= 1 || busy}
                              aria-label="Decrease quantity"
                              className="p-2 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-4 py-2 font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item, item.quantity + 1)}
                              disabled={busy}
                              aria-label="Increase quantity"
                              className="p-2 hover:bg-gray-100"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-lg" style={{ color: "var(--saffron)" }}>
                              {formatRs(item.priceSnapshot * item.quantity)}
                            </div>
                            <div className="text-xs" style={{ color: "var(--stone-gray)" }}>
                              {formatRs(item.priceSnapshot)} each
                              {item.silverPriceSnapshot ? ` · silver ${formatRs(item.silverPriceSnapshot)}/tola` : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-6">
            <div className="card lg:sticky lg:top-24">
              <div className="card-body">
                <h3 className="font-semibold text-lg mb-4" style={{ color: "var(--dark-gray)" }}>
                  Order Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--stone-gray)" }}>Items ({cart.totalItems})</span>
                    <span>{formatRs(cart.subtotal)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span style={{ color: "var(--dark-gray)" }}>Estimated total</span>
                    <span style={{ color: "var(--saffron)" }}>{formatRs(cart.subtotal)}</span>
                  </div>
                  {hasSilver && (
                    <p className="text-xs" style={{ color: "var(--stone-gray)" }}>
                      Silver items follow the daily silver rate. The final price is confirmed when we contact you.
                    </p>
                  )}
                </div>
                <div className="mt-6 space-y-3">
                  <Link to="/checkout" className="btn btn-primary w-full">
                    <CreditCard size={20} className="mr-2" />
                    Proceed to Checkout
                  </Link>
                  <Link to="/products" className="btn btn-secondary w-full">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
