const SilverPrice = require("../Model/silverPriceModel");
const { scrapeSilverPrice } = require("../Services/silverPriceScraper");

// Helper to get Nepal date (midnight)
function getNepalDate() {
  const now = new Date();
  const nepalTime = new Date(now.getTime() + (5 * 60 + 45) * 60 * 1000);
  nepalTime.setHours(0, 0, 0, 0);
  return nepalTime;
}

// Fetch and save price if new
exports.fetchAndSavePrice = async () => {
  const { price, scrapedAt } = await scrapeSilverPrice();
  const effectiveDate = getNepalDate();

  const existing = await SilverPrice.findOne({ effectiveDate });

  if (!existing) {
    await SilverPrice.create({
      pricePerTola: price,
      effectiveDate,
      lastScrapedAt: scrapedAt,
    });
    console.log(
      `✅ New price saved: ${price} on ${effectiveDate.toDateString()}`
    );
    return { price, saved: true };
  }

  if (existing.pricePerTola !== price) {
    existing.pricePerTola = price;
    existing.lastScrapedAt = scrapedAt;
    await existing.save();
    console.log(
      `🔄 Price updated: ${price} on ${effectiveDate.toDateString()}`
    );
    return { price, saved: true };
  }

  console.log("ℹ️ Price unchanged, no update needed.");
  return { price, saved: false };
};

// Manual test scrape
exports.testScraping = async (req, res) => {
  try {
    const { price, scrapedAt } = await scrapeSilverPrice();
    res.status(200).json({ message: "Scraping successful", price, scrapedAt });
  } catch (err) {
    res.status(500).json({ message: "Scraping failed", error: err.message });
  }
};

// Get latest price
exports.getLatestPrice = async (req, res) => {
  try {
    const latest = await SilverPrice.findOne().sort({ effectiveDate: -1 });
    if (!latest) {
      return res.status(404).json({ message: "No silver price found" });
    }
    res.status(200).json(latest);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch latest price", error: err.message });
  }
};

// Get price history
exports.getPriceHistory = async (req, res) => {
  try {
    const { limit = 30, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const history = await SilverPrice.find()
      .sort({ effectiveDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await SilverPrice.countDocuments();

    res.status(200).json({
      history,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: skip + history.length < total,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch history", error: err.message });
  }
};
