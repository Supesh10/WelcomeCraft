const Product = require("../Model/productModel");
const Category = require("../Model/categoryModel");
const fs = require("fs");
const path = require("path");
const { getLatestPrice } = require("./silverPriceController");

exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      categoryId,
      constantPrice,
      height,
      weightInTola,
      makingCost,
      weightRange,
      isCustomizable,
    } = req.body;

    console.log("Request body:", req.body);

    // Ensure categoryId is number if stored as number
    const catId = Number(categoryId);

    // 1. Fetch category
    const categoryDoc = await Category.findOne({ categoryId: catId });
    console.log("Category fetched:", categoryDoc);
    if (!categoryDoc) {
      return res.status(400).json({ message: "Category not found" });
    }

    // 2. Fetch silver price automatically
    let silverPricePerTola = 0;
    if (["silver", "customSilver"].includes(categoryDoc.type)) {
      silverPricePerTola = await getLatestPrice();
    }

    // 3. Validation based on category type
    if (categoryDoc.type === "silver") {
      if (!silverPricePerTola || !makingCost || !weightInTola) {
        return res.status(400).json({
          message:
            "Silver products require silverPricePerTola, makingCost, and weightInTola",
        });
      }
    } else if (categoryDoc.type === "customSilver") {
      if (!silverPricePerTola || !makingCost || !weightInTola) {
        return res.status(400).json({
          message:
            "Custom Silver products require silverPricePerTola, makingCost, and weightInTola",
        });
      }
      if (!weightRange || !weightRange.min || !weightRange.max) {
        return res.status(400).json({
          message:
            "Custom Silver products require weightRange with min and max values",
        });
      }
    } else if (categoryDoc.type === "gold") {
      if (!constantPrice || !height) {
        return res.status(400).json({
          message: "Gold products require constantPrice and height",
        });
      }
    }

    // 4. Process images
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Product images are required" });
    }

    const imageUrls = req.files.map(
      (file) =>
        `/uploads/products/${categoryDoc.name.replace(
          /\s+/g,
          "_"
        )}/${title.replace(/\s+/g, "_")}/${file.filename}`
    );

    // 5. Create product
    const newProduct = new Product({
      title,
      description,
      imageUrl: imageUrls, // match schema
      category: {
        categoryId: categoryDoc.categoryId,
        name: categoryDoc.name,
        description: categoryDoc.description,
        imageUrl: categoryDoc.imageUrl,
        type: categoryDoc.type,
      },
      constantPrice,
      height,
      silverPricePerTola,
      weightInTola,
      makingCost,
      weightRange,
      isCustomizable,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);
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
        name: { $regex: categoryName, $options: "i" },
      });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        return res.status(404).json({
          message: `No category found with name: ${categoryName}`,
          availableCategories: await Category.find({}, "name"),
        });
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch products with category population
    const products = await Product.find(filter)
      .populate({
        path: "category",
        select: "name description imageUrl",
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
        limit: parseInt(limit),
      },
      filter: filter,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
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
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const folderNameCategory = product.category.name.replace(/\s+/g, "_");
    const folderNameProduct = product.title.replace(/\s+/g, "_");
    const productFolder = path.join(
      __dirname,
      `../uploads/products/${folderNameCategory}/${folderNameProduct}`
    );

    // Ensure folder exists
    if (!fs.existsSync(productFolder)) {
      fs.mkdirSync(productFolder, { recursive: true });
    }

    // Delete old images if new files are uploaded
    if (req.files && req.files.length > 0) {
      product.images.forEach((imgPath) => {
        const oldPath = path.join(__dirname, `../${imgPath}`);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      });

      const newImages = req.files.map(
        (file) =>
          `/uploads/products/${folderNameCategory}/${folderNameProduct}/${file.filename}`
      );
      product.images = newImages;
    }

    // Update other fields (except images)
    const {
      title,
      description,
      constantPrice,
      height,
      silverPricePerTola,
      weightInTola,
      makingCost,
      weightRange,
      isCustomizable,
    } = req.body;
    if (title) product.title = title;
    if (description) product.description = description;
    if (constantPrice) product.constantPrice = constantPrice;
    if (height) product.height = height;
    if (silverPricePerTola) product.silverPricePerTola = silverPricePerTola;
    if (weightInTola) product.weightInTola = weightInTola;
    if (makingCost) product.makingCost = makingCost;
    if (weightRange) product.weightRange = weightRange;
    if (isCustomizable !== undefined) product.isCustomizable = isCustomizable;

    await product.save();
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Folder path: uploads/products/<Category>/<Product>
    const folderNameCategory = product.category.name.replace(/\s+/g, "_");
    const folderNameProduct = product.title.replace(/\s+/g, "_");
    const folderPath = path.join(
      __dirname,
      `../uploads/products/${folderNameCategory}/${folderNameProduct}`
    );

    // Delete product folder and its contents
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }

    res.status(200).json({
      message: "Product and its images deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};
