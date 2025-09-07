const cron = require("node-cron");
const updateSilver = require("../Controller/silverPriceController").fetchAndSavePrice;
const updateGold = require("../Controller/goldPriceController").fetchAndSavePrice;



cron.schedule("*/30 6-14 * * *", async () => {
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

console.log("🕰️ Cron scheduled: Every 30 mins from 6 AM to 2 PM");
module.exports = cron;
