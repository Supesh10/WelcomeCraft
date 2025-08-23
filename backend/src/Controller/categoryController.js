const Category = require("../Model/categoryModel");
const Product = require("../Model/productModel");

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (exists) {
      return res.status(400).json({ message: "Category with this name already exists" });
    }

    const newCategory = new Category({ name, description, imageUrl });
    await newCategory.save();

    res.status(201).json({ 
      message: "Category created successfully", 
      category: newCategory 
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Error creating category", error: error.message });
  }
};

// Get All Categories with product counts
exports.getAllCategories = async (req, res) => {
  try {
    const { includeProductCount = false } = req.query;
    
    const categories = await Category.find().sort({ name: 1 });
    
    if (includeProductCount === 'true') {
      // Add product count for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({ category: category._id });
          return {
            ...category.toObject(),
            productCount
          };
        })
      );
      return res.status(200).json({ categories: categoriesWithCounts });
    }
    
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
};

// Get Single Category
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category", error });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.categoryId,
      { name, description, imageUrl },
      { new: true }
    );

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Category updated", category });
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get products in this category
    const products = await Product.find({ category: categoryId })
      .populate({
        path: "category",
        select: "name description imageUrl"
      })
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    // Get total count
    const total = await Product.countDocuments({ category: categoryId });
    
    res.status(200).json({
      category: {
        _id: category._id,
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl
      },
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: skip + products.length < total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({ message: "Error fetching products by category", error: error.message });
  }
};

// Delete Category (with safety check for products)
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Check if category has products
    const productCount = await Product.countDocuments({ category: categoryId });
    if (productCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${productCount} products. Please move or delete products first.`,
        productCount
      });
    }
    
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Error deleting category", error: error.message });
  }
};
