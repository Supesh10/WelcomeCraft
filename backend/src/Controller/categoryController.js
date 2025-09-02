const Category = require("../Model/categoryModel");
const Product = require("../Model/productModel");
const fs = require("fs");
const path = require("path");

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, categoryId, type, details } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check duplicate name
    const nameExists = await Category.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    // Check duplicate custom ID if provided
    if (categoryId) {
      const idExists = await Category.findOne({ categoryId });
      if (idExists) {
        return res.status(400).json({ message: "Category ID already exists" });
      }
    }

    // Image path from route multer
    const imageUrl = req.file
      ? `/uploads/categories/${req.file.filename}`
      : null;

    const newCategory = new Category({
      name,
      description,
      categoryId: categoryId || undefined,
      type: type || "other",
      details: details ? JSON.parse(details) : {},
      imageUrl,
    });

    await newCategory.save();
    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res
      .status(500)
      .json({ message: "Error creating category", error: error.message });
  }
};

// Get all categories (optionally include product count)
exports.getAllCategories = async (req, res) => {
  try {
    const includeProductCount = req.query.includeProductCount === "true";

    const categories = await Category.find().sort({ name: 1 });

    if (includeProductCount) {
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({
            category: category._id,
          });
          return { ...category.toObject(), productCount };
        })
      );
      return res.status(200).json({ categories: categoriesWithCounts });
    }

    res.status(200).json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

// Get single category by MongoDB ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    console.error("Get category by ID error:", error);
    res
      .status(500)
      .json({ message: "Error fetching category", error: error.message });
  }
};

// Get single category by custom ID
exports.getCategoryByCustomId = async (req, res) => {
  try {
    const { customId } = req.params;
    const category = await Category.findOne({ categoryId: customId });
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    console.error("Get category by custom ID error:", error);
    res
      .status(500)
      .json({ message: "Error fetching category", error: error.message });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, type, details } = req.body;
    const category = await Category.findById(req.params.categoryId);

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    // Remove old image if new one is uploaded
    if (req.file) {
      if (category.imageUrl) {
        const oldImagePath = path.join(__dirname, "../", category.imageUrl);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      category.imageUrl = `/uploads/categories/${req.file.filename}`;
    }

    if (name) category.name = name;
    if (description) category.description = description;
    if (type) category.type = type;
    if (details) category.details = JSON.parse(details);

    await category.save();
    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error("Update category error:", error);
    res
      .status(500)
      .json({ message: "Error updating category", error: error.message });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const products = await Product.find({ category: categoryId })
      .populate({ path: "category", select: "name description imageUrl" })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ category: categoryId });

    res.status(200).json({
      category: {
        _id: category._id,
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
      },
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: skip + products.length < total,
        limit,
      },
    });
  } catch (error) {
    console.error("Get products by category error:", error);
    res
      .status(500)
      .json({
        message: "Error fetching products by category",
        error: error.message,
      });
  }
};

// Delete Category (with safety check for products)
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const productCount = await Product.countDocuments({ category: categoryId });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It has ${productCount} products. Please move or delete products first.`,
        productCount,
      });
    }

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    if (category.imageUrl) {
      const imagePath = path.join(__dirname, "../", category.imageUrl);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    res
      .status(200)
      .json({ message: "Category and image deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res
      .status(500)
      .json({ message: "Error deleting category", error: error.message });
  }
};
