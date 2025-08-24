const cron = require("node-cron");
const updateSilver = require("../Controller/silverPriceController").fetchAndSavePrice;
const updateGold = require("../Controller/goldPriceController").fetchAndSavePrice;



cron.schedule("*/15 5-13 * * *", async () => {
  console.log("🕐 Running scheduled price updates...");
  try {
    const silverResult = await updateSilver();
    console.log(
      `✅ Silver Cron: Price ${
        silverResult.saved ? "saved" : "unchanged"
      } at Rs. ${silverResult.price}`
    );

    const goldResult = await updateGold();
    console.log(
      `✅ Gold Cron: Price ${goldResult.saved ? "saved" : "unchanged"} at Rs. ${
        goldResult.price
      }`
    );
  } catch (error) {
    console.error("❌ Cron job error:", error.message);
  }
});

console.log("🕰️ Cron scheduled: Every 15 mins from 5 AM to 1 PM");
module.exports = cron;
