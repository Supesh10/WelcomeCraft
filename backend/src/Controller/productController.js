const Product = require("../Model/productModel");
const Category = require("../Model/categoryModel");

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      category,
      constantPrice,
      height,
      silverPricePerTola,
      weightInTola,
      makingCost,
      weightRange,
      isCustomizable,
    } = req.body;

    // Check if category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: "Category not found" });
    }

    // Validate required fields based on category type
    if (
      (categoryDoc.name === "Silver Crafts" ||
        categoryDoc.name === "Custom Silver") &&
      (!makingCost || !weightInTola)
    ) {
      return res.status(400).json({
        message:
          "Silver products require silverPricePerTola, makingCost, and weightInTola",
      });
    }

    if (
      categoryDoc.name === "Custom Silver" &&
      (!weightRange || !weightRange.min || !weightRange.max)
    ) {
      return res.status(400).json({
        message:
          "Custom Silver products require weightRange with min and max values",
      });
    }

    if (categoryDoc.name === "Gold Statue" && (!constantPrice || !height)) {
      return res.status(400).json({
        message: "Gold Statue products require constantPrice and height",
      });
    }

    // Create the product
    const newProduct = new Product({
      title,
      description,
      imageUrl,
      category,
      constantPrice,
      height,
      silverPricePerTola,
      weightInTola,
      makingCost,
      weightRange,
      isCustomizable,
    });

    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error });
  }
};

// Get all products with optional category filtering
exports.getAllProducts = async (req, res) => {
  try {
    const { category, categoryName, limit = 50, page = 1 } = req.query;
    
    // Build filter object
    let filter = {};
    
    // Filter by category ID
    if (category) {
      filter.category = category;
    }
    
    // Filter by category name (case-insensitive)
    if (categoryName) {
      const categoryDoc = await Category.findOne({ 
        name: { $regex: categoryName, $options: 'i' } 
      });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        return res.status(404).json({ 
          message: `No category found with name: ${categoryName}`,
          availableCategories: await Category.find({}, 'name')
        });
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch products with category population
    const products = await Product.find(filter)
      .populate({
        path: "category",
        select: "name description imageUrl"
      })
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    
    res.status(200).json({ 
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: skip + products.length < total,
        limit: parseInt(limit)
      },
      filter: filter
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate(
      "category"
    ); // Populate category details

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });  
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};

// Update product details
exports.updateProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      category,
      constantPrice,
      height,
      silverPricePerTola,
      weightInTola,
      makingCost,
      weightRange,
      isCustomizable,
    } = req.body;

    // Find the product and category
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: "Category not found" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        title,
        description,
        imageUrl,
        category,
        constantPrice,
        height,
        silverPricePerTola,
        weightInTola,
        makingCost,
        weightRange,
        isCustomizable,
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};
