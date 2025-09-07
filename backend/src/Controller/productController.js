const Product = require("../Model/productModel");
const Category = require("../Model/categoryModel");


// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category, // frontend sends category ID
      length,
      width,
      height,
      makingCost,
      weightInTola,
      customizable
    } = req.body;

    // Convert uploaded files to array of image URLs
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // Validate category by ID
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: "Category not found" });
    }

    // Create new product
    const product = new Product({
      title,
      description,
      images, // array of image paths
      category: categoryDoc._id,
      dimensions: {
        length: length || 0,
        width: width || 0,
        height: height || 0
      },
      makingCost: makingCost || 0,
      weightInTola: weightInTola || 0,
      isCustomizable: customizable
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
