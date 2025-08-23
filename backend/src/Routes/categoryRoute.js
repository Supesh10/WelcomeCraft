const express = require("express");
const router = express.Router();
const categoryController = require("../Controller/categoryController");
const authMiddleware = require("../Middleware/authMiddleware");

// Public routes
router.get("/categories", categoryController.getAllCategories); // Get all categories
router.get("/categories/:categoryId", categoryController.getCategoryById); // Get single category
router.get("/categories/:categoryId/products", categoryController.getProductsByCategory); // Get products by category

// Admin protected routes
router.post("/categories", authMiddleware, categoryController.createCategory); // Create category
router.put("/categories/:categoryId", authMiddleware, categoryController.updateCategory); // Update category
router.delete("/categories/:categoryId", authMiddleware, categoryController.deleteCategory); // Delete category

// Legacy routes (for backward compatibility)
router.get("/category", categoryController.getAllCategories);
router.get("/category/:categoryId", categoryController.getCategoryById);

module.exports = router;
