const mongoose = require("mongoose");

// Counter schema for category IDs
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 99 } // start from 100
});

const Counter = mongoose.model("Counter", counterSchema);

const categorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: Number,
      unique: true,
      required: true,
    },
    name: { type: String, required: true, unique: true },
    description: String,
    imageUrl: String,
  },
  { timestamps: true }
);

// Generate incremental numeric categoryId before saving
categorySchema.pre("save", async function (next) {
  if (this.isNew && !this.categoryId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        "categoryId",
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      this.categoryId = counter.sequence_value; // numeric ID like 100, 101, etc.
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Find by custom numeric ID
categorySchema.statics.findByCategoryId = function (categoryId) {
  return this.findOne({ categoryId });
};

module.exports = mongoose.model("Category", categorySchema);
