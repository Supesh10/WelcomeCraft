const mongoose = require('mongoose');

// Cart Item Schema for individual products in cart
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  priceSnapshot: {
    type: Number,
    required: true // Price at the time of adding to cart
  },
  silverPriceSnapshot: {
    type: Number // Silver price per tola when added (for silver products)
  },
  customization: {
    type: String // Custom requirements for the product
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Main Cart Schema
const cartSchema = new mongoose.Schema({
  // Session-based cart (no user registration required)
  sessionId: {
    type: String,
    required: true,
    unique: true // One cart per session
  },
  
  // Optional customer info (filled when proceeding to checkout)
  customerName: { type: String },
  customerPhone: { type: String },
  customerEmail: { type: String },
  customerAddress: { type: String },
  
  // Cart items
  items: [cartItemSchema],
  
  // Cart totals
  subtotal: {
    type: Number,
    default: 0
  },
  
  totalItems: {
    type: Number,
    default: 0
  },
  
  // Cart status
  status: {
    type: String,
    enum: ['active', 'checkout', 'ordered', 'abandoned'],
    default: 'active'
  },
  
  // Notes for the entire order
  orderNotes: { type: String },
  
  // Expiry for cleanup (carts expire after 7 days of inactivity)
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // 7 days in seconds
  }
  
}, { 
  timestamps: true,
  // Auto-update expiresAt on any cart activity
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update expiresAt on any modification
cartSchema.pre('save', function(next) {
  this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  next();
});

// Virtual for calculated total (in case prices changed)
cartSchema.virtual('calculatedTotal').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.priceSnapshot * item.quantity);
  }, 0);
});

// Method to recalculate totals
cartSchema.methods.recalculateTotals = function() {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.subtotal = this.items.reduce((total, item) => total + (item.priceSnapshot * item.quantity), 0);
  return this;
};

// Static method to find or create cart by session
cartSchema.statics.findOrCreateBySession = async function(sessionId) {
  let cart = await this.findOne({ sessionId, status: 'active' })
    .populate({
      path: 'items.product',
      populate: {
        path: 'category',
        select: 'name'
      }
    });
    
  if (!cart) {
    cart = await this.create({ sessionId });
    // Populate after creation
    cart = await this.findById(cart._id).populate({
      path: 'items.product',
      populate: {
        path: 'category',
        select: 'name'
      }
    });
  }
  
  return cart;
};

module.exports = mongoose.model('Cart', cartSchema);
