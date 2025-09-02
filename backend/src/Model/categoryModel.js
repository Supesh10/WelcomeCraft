const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    imageUrl: String, // single image
    details: { type: Object, default: {} },
    type: {
      type: String,
      required: true,
      enum: ["silver", "customSilver", "gold", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
