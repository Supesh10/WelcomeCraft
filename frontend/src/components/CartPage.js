import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Edit,
  ChevronRight,
  Package,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  MessageCircle
} from 'lucide-react';
import ApiService from '../services/apiService';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [error, setError] = useState(null);
  const [silverPrice, setSilverPrice] = useState(null);
  const [goldPrice, setGoldPrice] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [customizationText, setCustomizationText] = useState('');

  const sessionId = ApiService.getSessionId();

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);

      const [cartResponse, silverPriceResponse, goldPriceResponse] = await Promise.allSettled([
        ApiService.getCart(sessionId),
        ApiService.getTodaysSilverPrice(),
        ApiService.getTodaysGoldPrice()
      ]);

      // Handle cart
      if (cartResponse.status === 'fulfilled') {
        setCart(cartResponse.value);
      } else {
        setError('Failed to load cart');
      }

      // Handle prices
      if (silverPriceResponse.status === 'fulfilled') {
        setSilverPrice(silverPriceResponse.value);
      }
      if (goldPriceResponse.status === 'fulfilled') {
        setGoldPrice(goldPriceResponse.value);
      }

    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }));
      
      await ApiService.updateCartItem(sessionId, itemId, newQuantity);
      await fetchCart(); // Refresh cart
      
      // Trigger storage event to update navbar
      window.dispatchEvent(new Event('storage'));
      
    } catch (err) {
      console.error('Failed to update quantity:', err);
      setError('Failed to update quantity. Please try again.');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }));
      
      await ApiService.removeFromCart(sessionId, itemId);
      await fetchCart(); // Refresh cart
      
      // Trigger storage event to update navbar
      window.dispatchEvent(new Event('storage'));
      
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError('Failed to remove item. Please try again.');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Update customization
  const updateCustomization = async (itemId, customization) => {
    try {
      const item = cart.items.find(i => i._id === itemId);
      await ApiService.updateCartItem(sessionId, itemId, item.quantity, customization);
      await fetchCart(); // Refresh cart
      setEditingItem(null);
      setCustomizationText('');
    } catch (err) {
      console.error('Failed to update customization:', err);
      setError('Failed to update customization. Please try again.');
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    try {
      setLoading(true);
      await ApiService.clearCart(sessionId);
      await fetchCart();
      
      // Trigger storage event to update navbar
      window.dispatchEvent(new Event('storage'));
      
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError('Failed to clear cart. Please try again.');
    }
  };

  // Calculate updated price for silver items
  const calculateCurrentPrice = (item) => {
    const product = item.product;
    
    if (product.constantPrice) {
      return product.constantPrice;
    }

    if (silverPrice && product.weightInTola && product.makingCost) {
      return (silverPrice.pricePerTola * product.weightInTola + product.makingCost);
    }

    return item.priceSnapshot; // Fallback to original price
  };

  // Check if price has changed
  const hasPriceChanged = (item) => {
    const currentPrice = calculateCurrentPrice(item);
    return Math.abs(currentPrice - item.priceSnapshot) > 0.01;
  };

  // Start editing customization
  const startEditingCustomization = (item) => {
    setEditingItem(item._id);
    setCustomizationText(item.customization || '');
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p style={{ color: 'var(--stone-gray)' }}>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <ShoppingCart size={24} className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--dark-gray)' }}>
            Cart Error
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchCart} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="container mx-auto px-6 py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingCart size={32} style={{ color: 'var(--stone-gray)' }} />
            </div>
            <h1 className="text-3xl font-display font-bold mb-4" style={{ color: 'var(--dark-gray)' }}>
              Your Cart is Empty
            </h1>
            <p className="mb-8" style={{ color: 'var(--stone-gray)' }}>
              Looks like you haven't added any items to your cart yet. Explore our collection of beautiful Buddhist handicrafts.
            </p>
            <div className="space-y-4">
              <Link to="/products" className="btn btn-primary block">
                <Package size={20} className="mr-2" />
                Browse Products
              </Link>
              <Link to="/" className="btn btn-secondary block">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-secondary btn-sm"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-display font-bold" style={{ color: 'var(--dark-gray)' }}>
                Shopping Cart
              </h1>
              <p className="text-sm" style={{ color: 'var(--stone-gray)' }}>
                {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
          
          {cart.items.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={fetchCart}
                className="btn btn-secondary btn-sm"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={clearCart}
                className="btn btn-outline btn-sm text-red-600 border-red-600 hover:bg-red-600"
              >
                <Trash2 size={16} />
                Clear Cart
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => setError(null)} 
              className="text-red-500 hover:text-red-700 text-sm mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const currentPrice = calculateCurrentPrice(item);
              const priceChanged = hasPriceChanged(item);
              
              return (
                <div key={item._id} className="card">
                  <div className="card-body">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Product Image */}
                      <div className="w-full md:w-32 h-32 flex-shrink-0">
                        <img
                          src={item.product.imageUrl || '/api/placeholder/300/300'}
                          alt={item.product.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg" style={{ color: 'var(--dark-gray)' }}>
                              {item.product.title}
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--stone-gray)' }}>
                              {item.product.category?.name}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item._id)}
                            disabled={updating[item._id]}
                            className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Customization */}
                        {item.product.isCustomizable && (
                          <div>
                            {editingItem === item._id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={customizationText}
                                  onChange={(e) => setCustomizationText(e.target.value)}
                                  placeholder="Add your customization requirements..."
                                  className="input-field w-full h-20 resize-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateCustomization(item._id, customizationText)}
                                    className="btn btn-primary btn-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingItem(null);
                                      setCustomizationText('');
                                    }}
                                    className="btn btn-secondary btn-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 p-3 rounded">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                      Customization
                                    </p>
                                    <p className="text-sm" style={{ color: 'var(--dark-gray)' }}>
                                      {item.customization || 'No customization specified'}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => startEditingCustomization(item)}
                                    className="btn btn-ghost btn-sm"
                                  >
                                    <Edit size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm" style={{ color: 'var(--stone-gray)' }}>
                              Quantity:
                            </span>
                            <div className="flex items-center border rounded">
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updating[item._id]}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="px-4 py-2 font-medium">
                                {updating[item._id] ? '...' : item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                disabled={updating[item._id]}
                                className="p-2 hover:bg-gray-100"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="text-right">
                            {priceChanged && (
                              <div className="text-xs text-orange-600 mb-1">
                                Price updated due to live metal rates
                              </div>
                            )}
                            <div className="font-bold text-lg" style={{ color: 'var(--saffron)' }}>
                              Rs. {Math.round(currentPrice * item.quantity).toLocaleString()}
                            </div>
                            {priceChanged && (
                              <div className="text-xs line-through text-gray-400">
                                Rs. {Math.round(item.priceSnapshot * item.quantity).toLocaleString()}
                              </div>
                            )}
                            <div className="text-xs" style={{ color: 'var(--stone-gray)' }}>
                              Rs. {Math.round(currentPrice).toLocaleString()} each
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

          {/* Cart Summary */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-body">
                <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--dark-gray)' }}>
                  Order Summary
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--stone-gray)' }}>Items ({cart.totalItems})</span>
                    <span>Rs. {Math.round(cart.calculatedTotal || cart.subtotal).toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span style={{ color: 'var(--dark-gray)' }}>Total</span>
                      <span style={{ color: 'var(--saffron)' }}>
                        Rs. {Math.round(cart.calculatedTotal || cart.subtotal).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Link
                    to="/checkout"
                    className="btn btn-primary w-full"
                  >
                    <CreditCard size={20} className="mr-2" />
                    Proceed to Checkout
                  </Link>
                  
                  <Link
                    to="/products"
                    className="btn btn-secondary w-full"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* Live Price Notice */}
            {(silverPrice || goldPrice) && (
              <div className="card">
                <div className="card-body">
                  <h4 className="font-medium mb-3" style={{ color: 'var(--dark-gray)' }}>
                    Live Price Updates
                  </h4>
                  <div className="space-y-2 text-sm">
                    {silverPrice && (
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--stone-gray)' }}>Silver (per tola)</span>
                        <span>Rs. {silverPrice.pricePerTola?.toLocaleString()}</span>
                      </div>
                    )}
                    {goldPrice && (
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--stone-gray)' }}>Gold (per tola)</span>
                        <span>Rs. {goldPrice.pricePerTola?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--stone-gray)' }}>
                    Prices may update based on current metal rates
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
