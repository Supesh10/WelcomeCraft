const mongoose = require("mongoose");

const goldPriceSchema = new mongoose.Schema({
  pricePerTola: { type: Number, required: true }, // in NPR
  effectiveDate: { type: Date, required: true }, // Date only (no time) to identify daily price
  lastScrapedAt: { type: Date, default: Date.now }, // When this price was last scraped
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model("goldPrice", goldPriceSchema);
