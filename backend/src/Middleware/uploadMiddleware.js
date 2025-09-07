const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/others"; // default

    if (req.originalUrl.includes("products")) {
      // For products, we need to create nested folders
      const { type, title } = req.body;

      if (type && title) {
        const categoryName = type.toString();

        // Create nested folder structure: uploads/products/CategoryName/ProductTitle
        folder = `uploads/products/${categoryName.replace(
          /\s+/g,
          "_"
        )}/${title.replace(/\s+/g, "_")}`;
      } else {
        // Fallback to basic products folder if category/title not available
        folder = "uploads/products";
      }
    } else if (req.baseUrl.includes("categories")) {
      folder = "uploads/categories";
    }

    // Create folder if it doesn't exist
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`Created folder: ${folder}`);
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Prevent filename collisions
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname
      .replace(ext, "")
      .replace(/\s+/g, "_")
      .toLowerCase();
    cb(null, `${timestamp}-${safeName}${ext}`);
  },
});

// File filter: allow images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
  }
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max per file
});

module.exports = upload;
