const Cart = require("../Model/cartModel");
const Product = require("../Model/productModel");
const { getCurrentSilverPrice } = require("../Services/silverPriceScraper");
const { generateCustomerOrderUrl } = require("../Services/messagingService");

// Helper function to calculate current product price
async function calculateProductPrice(product) {
  if (product.constantPrice) {
    return product.constantPrice;
  }

  if (
    product.category.name === "Silver Crafts" ||
    product.category.name === "Custom Silver"
  ) {
    if (product.weightInTola && product.makingCost) {
      const silverPrice = await getCurrentSilverPrice();
      if (silverPrice) {
        return (
          silverPrice.pricePerTola * product.weightInTola + product.makingCost
        );
      }
    }
  }

  return 0; // Fallback
}

// Get cart by session ID
getCart = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const cart = await Cart.findOrCreateBySession(sessionId);

    res.status(200).json({
      cart,
      summary: {
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        calculatedTotal: cart.calculatedTotal,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
};

// Add item to cart
addToCart = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { productId, quantity = 1, customization } = req.body;

    if (!sessionId || !productId) {
      return res
        .status(400)
        .json({ message: "Session ID and Product ID are required" });
    }

    // Find product with category
    const product = await Product.findById(productId).populate("category");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Calculate current price
    const currentPrice = await calculateProductPrice(product);

    // Get current silver price for snapshot
    let silverPriceSnapshot = null;
    if (
      product.category.name === "Silver Crafts" ||
      product.category.name === "Custom Silver"
    ) {
      const silverPrice = await getCurrentSilverPrice();
      silverPriceSnapshot = silverPrice ? silverPrice.pricePerTola : null;
    }

    // Find or create cart
    const cart = await Cart.findOrCreateBySession(sessionId);

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].priceSnapshot = currentPrice; // Update to current price
      if (customization) {
        cart.items[existingItemIndex].customization = customization;
      }
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        priceSnapshot: currentPrice,
        silverPriceSnapshot,
        customization,
        addedAt: new Date(),
      });
    }

    // Recalculate totals and save
    cart.recalculateTotals();
    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name description",
      },
    });

    res.status(200).json({
      message: "Item added to cart successfully",
      cart: updatedCart,
      summary: {
        totalItems: updatedCart.totalItems,
        subtotal: updatedCart.subtotal,
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res
      .status(500)
      .json({ message: "Error adding item to cart", error: error.message });
  }
};

// Update cart item quantity
updateCartItem = async (req, res) => {
  try {
    const { sessionId, itemId } = req.params;
    const { quantity, customization } = req.body;

    if (!sessionId || !itemId) {
      return res
        .status(400)
        .json({ message: "Session ID and Item ID are required" });
    }

    if (quantity && quantity < 0) {
      return res.status(400).json({ message: "Quantity must be positive" });
    }

    const cart = await Cart.findOne({ sessionId, status: "active" });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Update item
      if (quantity) cart.items[itemIndex].quantity = quantity;
      if (customization !== undefined)
        cart.items[itemIndex].customization = customization;
    }

    // Recalculate totals and save
    cart.recalculateTotals();
    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name description",
      },
    });

    res.status(200).json({
      message: "Cart updated successfully",
      cart: updatedCart,
      summary: {
        totalItems: updatedCart.totalItems,
        subtotal: updatedCart.subtotal,
      },
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
};

// Remove item from cart
removeFromCart = async (req, res) => {
  try {
    const { sessionId, itemId } = req.params;

    const cart = await Cart.findOne({ sessionId, status: "active" });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items.splice(itemIndex, 1);
    cart.recalculateTotals();
    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name description",
      },
    });

    res.status(200).json({
      message: "Item removed from cart successfully",
      cart: updatedCart,
      summary: {
        totalItems: updatedCart.totalItems,
        subtotal: updatedCart.subtotal,
      },
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res
      .status(500)
      .json({ message: "Error removing item from cart", error: error.message });
  }
};

// Clear entire cart
clearCart = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const cart = await Cart.findOne({ sessionId, status: "active" });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.recalculateTotals();
    await cart.save();

    res.status(200).json({
      message: "Cart cleared successfully",
      cart,
      summary: {
        totalItems: 0,
        subtotal: 0,
      },
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};

// Proceed to checkout (update customer info)
updateCustomerInfo = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      orderNotes,
    } = req.body;

    if (!customerName || !customerPhone) {
      return res
        .status(400)
        .json({ message: "Customer name and phone are required" });
    }

    const cart = await Cart.findOne({ sessionId, status: "active" }).populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name description",
      },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Update customer info
    cart.customerName = customerName;
    cart.customerPhone = customerPhone;
    cart.customerEmail = customerEmail;
    cart.customerAddress = customerAddress;
    cart.orderNotes = orderNotes;
    cart.status = "checkout";

    await cart.save();

    res.status(200).json({
      message: "Customer information updated successfully",
      cart,
      summary: {
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
      },
    });
  } catch (error) {
    console.error("Update customer info error:", error);
    res
      .status(500)
      .json({
        message: "Error updating customer information",
        error: error.message,
      });
  }
};

// Generate WhatsApp checkout URL
generateCheckoutUrl = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const cart = await Cart.findOne({ sessionId }).populate({
      path: "items.product",
      populate: {
        path: "category",
        select: "name description",
      },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Generate comprehensive WhatsApp message
    let message = `🛒 *NEW ORDER FROM WELCOME-CRAFT* 🛒\n\n`;

    if (cart.customerName) {
      message += `👤 *Customer Details:*\n`;
      message += `Name: ${cart.customerName}\n`;
      message += `Phone: ${cart.customerPhone}\n`;
      if (cart.customerEmail) message += `Email: ${cart.customerEmail}\n`;
      if (cart.customerAddress)
        message += `Address: ${cart.customerAddress}\n\n`;
    }

    message += `📦 *Order Items (${cart.totalItems} items):*\n`;

    cart.items.forEach((item, index) => {
      message += `\n${index + 1}. *${item.product.title}*\n`;
      message += `   Category: ${item.product.category.name}\n`;
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Price: Rs. ${item.priceSnapshot} each\n`;
      message += `   Subtotal: Rs. ${item.priceSnapshot * item.quantity}\n`;
      if (item.customization) {
        message += `   *Custom Requirements:* ${item.customization}\n`;
      }
    });

    message += `\n💰 *Total Amount: Rs. ${cart.subtotal}*\n`;

    if (cart.orderNotes) {
      message += `\n📝 *Order Notes:*\n${cart.orderNotes}\n`;
    }

    message += `\n⏰ Order Time: ${new Date().toLocaleString()}\n`;
    message += `\nPlease confirm this order and provide payment details.\n\nThank you! 🙏`;

    // Generate WhatsApp URL
    const adminPhone = process.env.WHATSAPP_PHONE || "977XXXXXXXXX";
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
      message
    )}`;

    // Mark cart as ordered
    cart.status = "ordered";
    await cart.save();

    res.status(200).json({
      message: "Checkout URL generated successfully",
      whatsappUrl,
      orderSummary: {
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        customerName: cart.customerName,
        customerPhone: cart.customerPhone,
      },
    });
  } catch (error) {
    console.error("Generate checkout URL error:", error);
    res
      .status(500)
      .json({ message: "Error generating checkout URL", error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  updateCustomerInfo,
  generateCheckoutUrl,
};
