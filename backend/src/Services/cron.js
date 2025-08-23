const cron = require("node-cron");
const { fetchAndSaveSilverPrice } = require("../Controller/silverPriceController");
const { fetchAndSaveGoldPrice } = require("../Controller/goldPriceController");

cron.schedule("*/30 6-14 * * *", async () => {
  console.log("🕐 Running scheduled silver price update...");
  try {
    const silverResult = await fetchAndSaveSilverPrice();
    const goldResult = await fetchAndSaveGoldPrice();
    console.log(
      `✅ Cron: Price ${silverResult.saved ? "saved" : "unchanged"} at Nrs. ${
        silverResult.price
      }`
       `✅ Cron: Price ${goldResult.saved ? "saved" : "unchanged"} at Nrs. ${
        goldResult.price
      }`
    );
  } catch (error) {
    console.error("❌ Cron job error:", error.message);
  }
});

console.log("🕰️ Cron scheduled: Every 30 mins from 6 AM to 2 PM");
module.exports = cron;
