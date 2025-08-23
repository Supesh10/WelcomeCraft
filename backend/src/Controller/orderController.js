const Order = require("../Model/orderModel");
const Product = require("../Model/productModel");
const SilverPrice = require("../Model/silverPriceModel");
const { sendWhatsAppOrderNotification } = require("../Services/messagingService");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      productId,
      quantity = 1,
      notes,
      customization
    } = req.body;

    // Basic validation
    if (!customerName || !customerPhone || !productId) {
      return res.status(400).json({ 
        message: "Customer name, phone, and product ID are required" 
      });
    }

    // Find the product
    const product = await Product.findById(productId).populate('category');
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let silverPriceSnapshot = null;
    let totalPrice = null;

    // Calculate price for silver products
    if (product.category.name === "Silver Crafts" || product.category.name === "Custom Silver") {
      const todaySilverPrice = await SilverPrice.findOne().sort({ effectiveDate: -1 });
      if (todaySilverPrice) {
        silverPriceSnapshot = todaySilverPrice.pricePerTola;
        if (product.weightInTola && product.makingCost) {
          totalPrice = (silverPriceSnapshot * product.weightInTola + product.makingCost) * quantity;
        }
      }
    } else if (product.constantPrice) {
      totalPrice = product.constantPrice * quantity;
    }

    const newOrder = new Order({
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      product: productId,
      quantity,
      notes,
      customization,
      silverPriceSnapshot,
      totalPrice,
      status: 'pending'
    });

    await newOrder.save();
    
    // Populate the saved order for response
    const populatedOrder = await Order.findById(newOrder._id).populate('product');
    
    // Generate WhatsApp notification (optional)
    const whatsappNotification = sendWhatsAppOrderNotification(populatedOrder, product);
    
    res.status(201).json({ 
      message: "Order created successfully", 
      order: populatedOrder,
      whatsappNotification
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};

// Get All Orders
exports.getOrders = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    // Build filter
    let filter = {};
    if (status) {
      filter.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get orders with populated product and category data
    const orders = await Order.find(filter)
      .populate({
        path: "product",
        populate: {
          path: "category",
          select: "name description"
        }
      })
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    // Get total count
    const total = await Order.countDocuments(filter);
    
    res.status(200).json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: skip + orders.length < total,
        limit: parseInt(limit)
      },
      filter
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// Update Order
exports.updateOrder = async (req, res) => {
  try {
    const { status, quantity } = req.body;
    const updateFields = {};
    if (status) updateFields.status = status;
    if (quantity) updateFields.quantity = quantity;

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      updateFields,
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order updated", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error });
  }
};

// Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error });
  }
};
