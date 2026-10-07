const SilverPrice = require("../Model/silverPriceModel");
const { scrapeSilverPrice } = require("../Services/silverPriceScraper");

function getNepaliTime() {
  // Nepali time is UTC +5:45
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const nepaliTime = new Date(utc + (5 * 60 + 45) * 60000);

  return nepaliTime;
}

function getNepaliDateString() {
  const nepaliTime = getNepaliTime();
  
  // Format as YYYY-MM-DD for effective date comparison
  const year = nepaliTime.getFullYear();
  const month = String(nepaliTime.getMonth() + 1).padStart(2, "0");
  const day = String(nepaliTime.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Fetch and save price if new
exports.fetchAndSavePrice = async () => {
  try {
    const { price, scrapedAt, dailyChange } = await scrapeSilverPrice();
    const now = getNepaliTime();
    const dateString = getNepaliDateString();
    
    // Set effective date to start of day for consistent comparison
    const effectiveDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find existing record for today
    const existing = await SilverPrice.findOne({
      effectiveDate: {
        $gte: effectiveDate,
        $lt: new Date(effectiveDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!existing) {
      await SilverPrice.create({
        pricePerTola: price,
        effectiveDate,
        lastScrapedAt: scrapedAt,
        dailyChange: dailyChange,
      });
      console.log(
        `✅ New price saved: ${price} on ${dateString} DailyChange: ${dailyChange}`
      );
      return { price, saved: true, dailyChange };
    }

    // Update if price changed and this is a more recent scrape
    if (existing.pricePerTola !== price && scrapedAt > existing.lastScrapedAt) {
      existing.pricePerTola = price;
      existing.lastScrapedAt = scrapedAt;
      existing.dailyChange = dailyChange;
      await existing.save();
      console.log(`🔄 Price updated: ${price} on ${dateString}`);
      return { price, saved: true, dailyChange };
    }

    console.log("ℹ️ Price unchanged, no update needed.");
    return { price, saved: false, dailyChange };
  } catch (error) {
    console.error('Error in fetchAndSavePrice:', error);
    throw error;
  }
};

// Manual test scrape
exports.testScraping = async (req, res) => {
  try {
    const { price, scrapedAt, dailyChange } = await scrapeSilverPrice();
    res
      .status(200)
      .json({ message: "Scraping successful", price, scrapedAt, dailyChange });
  } catch (err) {
    res.status(500).json({ message: "Scraping failed", error: err.message });
  }
};

// Manual scrape and save
exports.manualScrapeAndSave = async (req, res) => {
  try {
    const result = await exports.fetchAndSavePrice();
    res.status(200).json({
      success: true,
      message: "Manual silver price scrape completed",
      data: {
        price: result.price,
        saved: result.saved,
        dailyChange: result.dailyChange
      }
    });
  } catch (err) {
    console.error('Manual scrape error:', err);
    res.status(500).json({
      success: false,
      message: "Manual scraping failed",
      error: err.message
    });
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

exports.fetchLatestPrice = async (req, res) => {
  try {
    const latest = await SilverPrice.findOne().sort({ effectiveDate: -1 });
    if (!latest) {
      return res.status(404).json({ message: "No silver price found" });
    }
    console.log("Latest silver price fetched:", latest.pricePerTola);
    return latest;
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
