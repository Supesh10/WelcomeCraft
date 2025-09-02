const express = require("express");
const router = express.Router();
const categoryController = require("../Controller/categoryController");
const authMiddleware = require("../Middleware/authMiddleware");
const upload = require("../Middleware/uploadMiddleware");
const path = require("path");

// Public routes
router.get("/categories", categoryController.getAllCategories); // Get all categories
router.get("/categories/:categoryId", categoryController.getCategoryById); // Get single category
router.get(
  "/categories/custom/:customId",
  categoryController.getCategoryByCustomId
); // Get category by custom ID
router.get(
  "/categories/:categoryId/products",
  categoryController.getProductsByCategory
); // Get products by category

// Admin protected routes
router.post(
  "/categories",
  authMiddleware,
  upload.single("imageUrl"),
  categoryController.createCategory
); // Create category

router.put(
  "/categories/:categoryId",
  authMiddleware,
  upload.single("imageUrl"),
  categoryController.updateCategory
); // Update category

router.delete(
  "/categories/:categoryId",
  authMiddleware,
  categoryController.deleteCategory
); // Delete category

// Legacy routes (for backward compatibility)
router.get("/category", categoryController.getAllCategories);
router.get("/category/:categoryId", categoryController.getCategoryById);

module.exports = router;
