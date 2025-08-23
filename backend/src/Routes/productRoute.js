const express = require("express");
const productController = require("../Controller/productController");
const router = express.Router();

// Create a new product
router.post("/products", productController.createProduct);

// Get all products
router.get("/products", productController.getAllProducts);

// Get a single product by ID
router.get("/products/:productId", productController.getProductById);

// Update a product
router.put("/products/:productId", productController.updateProduct);

// Delete a product
router.delete("/products/:productId", productController.deleteProduct);

module.exports = router;
