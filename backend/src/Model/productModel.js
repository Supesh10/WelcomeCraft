const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },

    // Category - linking to the Category model
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // Gold-specific fields (constant price)
    constantPrice: {
      type: Number,
    },
    height: {
      type: String,
    },

    // Silver stocked products (dynamic price based on silver price)
    silverPricePerTola: {
      type: Number,
    },
    makingCost: {
      type: Number,
    },
    weightInTola: {
      type: Number,
    },

    // Silver custom products (dynamic price + weight range)
    weightRange: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
    },

    // Flags
    isCustomizable: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
