const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

// Saved files are served by app.js at /uploads/<filename>
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  // Random suffix so several images uploaded in the same millisecond
  // don't overwrite each other
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
  },
});

const ALLOWED = /^(image\/(jpeg|png|webp|gif))$/;

const fileFilter = (req, file, cb) => {
  if (ALLOWED.test(file.mimetype)) return cb(null, true);
  const error = new Error("Only JPG, PNG, WEBP or GIF images are allowed");
  error.status = 400;
  cb(error);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

// Turns a saved file into the path stored in the database
const toPublicPath = (file) => `/uploads/${file.filename}`;

// Delete files from this request, e.g. when saving the product failed
const removeUploadedFiles = (req) => {
  const files = [...(req.files || []), ...(req.file ? [req.file] : [])];
  files.forEach((f) => fs.unlink(f.path, () => {}));
};

// Wrap a multer handler so upload errors return 400 JSON instead of a 500
// HTML page, and so files from a rejected request don't stay on disk
const handle = (middleware) => (req, res, next) =>
  middleware(req, res, (err) => {
    res.on("finish", () => {
      if (res.statusCode >= 400) removeUploadedFiles(req);
    });
    if (!err) return next();
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Each image must be 5 MB or smaller" : err.message;
    res.status(err.status || 400).json({ message });
  });

module.exports = {
  UPLOAD_DIR,
  toPublicPath,
  removeUploadedFiles,
  productImages: handle(upload.array("images", 10)),
  categoryImage: handle(upload.single("image")),
};
