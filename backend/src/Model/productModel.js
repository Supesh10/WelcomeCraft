const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    // Updated imageUrl to handle arrays properly
    imageUrl: [
      {
        type: String,
        required: false, // Make individual items not required since array itself can be validated
      },
    ],

    // Embed full category details
    category: {
      categoryId: { type: String, required: true },
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
    isCustomizable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add validation to ensure at least one image is provided
productSchema.pre("save", function (next) {
  if (!this.imageUrl || this.imageUrl.length === 0) {
    return next(new Error("At least one product image is required"));
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
