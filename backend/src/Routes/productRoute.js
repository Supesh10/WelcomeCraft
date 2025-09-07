const express = require("express");
const productController = require("../Controller/productController");
const authMiddleware = require("../Middleware/authMiddleware");
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });


// Create a new product
// router.post("/products", authMiddleware, productController.createProduct);
router.post('/products', upload.array('images'), productController.createProduct);


// Get all products
router.get("/products", productController.getAllProducts);

// Get a single product by ID
router.get("/products/:productId",productController.getProductById);

// Update a product
router.put("/products/:productId", authMiddleware, productController.updateProduct);

// Delete a product
router.delete("/products/:productId", authMiddleware, productController.deleteProduct);

module.exports = router;
