const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../Model/adminModel");
const authMiddleware = require("../Middleware/authMiddleware");
const router = express.Router();

// Admin login
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find admin by email
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: admin._id,
        email: admin.email,
        isAdmin: true
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
});

// Create admin (protected route)
router.post("/admin/create", authMiddleware, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email
      }
    });
  } catch (error) {
    console.error("Admin creation error:", error);
    res.status(500).json({ message: "Error creating admin", error: error.message });
  }
});

// Get admin profile (protected route)
router.get("/admin/profile", authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    res.json({ admin });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ message: "Error fetching admin profile", error: error.message });
  }
});

// Initialize default admin (for first-time setup)
router.post("/admin/init", async (req, res) => {
  try {
    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({ message: "Admin already exists. Use /admin/login to authenticate." });
    }

    // Create default admin using environment variables
    const defaultUsername = process.env.ADMIN_USERNAME || "admin";
    const defaultPassword = process.env.ADMIN_PASSWORD || "admin123";

    console.log("Creating default admin with username:", defaultUsername, "and password:", defaultPassword);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const defaultAdmin = new Admin({
      username: defaultUsername,        // <-- MATCH SCHEMA FIELD
      passwordHash: hashedPassword      // <-- MATCH SCHEMA FIELD
    });

    await defaultAdmin.save();

    res.status(201).json({
      message: "Default admin created successfully",
      username: defaultUsername,
      note: "Please login with these credentials and change the password"
    });
  } catch (error) {
    console.error("Admin initialization error:", error);
    res.status(500).json({ message: "Error initializing admin", error: error.message });
  }
});

module.exports = router;


