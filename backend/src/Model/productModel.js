const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },

    // Embed full category details
    category: {
      categoryId: { type: Number, required: true },
      name: { type: String, required: true },
      description: { type: String },
      imageUrl: [{ type: String }],
      type: {
        type: String,
        required: true,
        enum: ["silver", "customSilver", "gold", "other"],
        default: "other",
      },
    },

    // Gold-specific fields (constant price)
    constantPrice: Number,
    height: String,

    // Silver stocked products
    silverPricePerTola: Number,
    makingCost: Number,
    weightInTola: Number,

    // Silver custom products
    weightRange: {
      min: Number,
      max: Number,
    },

    // Flags
    isCustomizable: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
