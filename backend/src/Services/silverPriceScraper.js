const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeSilverPrice() {
  try {
    const { data: html } = await axios.get(
      "https://www.sharesansar.com/bullion"
    );
    const $ = cheerio.load(html);

    // Find the row that contains "Silver"
    const silverRow = $("table tbody tr").filter((i, el) => {
      return $(el).find("td").first().text().trim().toLowerCase() === "silver";
    });

    if (!silverRow.length) {
      throw new Error("Silver price row not found on sharesansar.com");
    }

    // Get the price from the third column
    const priceText = silverRow.find("td").eq(2).text().trim();
    const price = parseFloat(priceText.replace(/Rs\.|,/g, "").trim());

    if (isNaN(price)) {
      throw new Error(`Parsed silver price is invalid: ${priceText}`);
    }

    const scrapedAt = new Date();
    console.log(`✅ Scraped silver price: Nrs. ${price}`);
    return { price, scrapedAt };
  } catch (err) {
    console.error("❌ Error scraping silver price:", err.message);
    throw err;
  }
}

module.exports = { scrapeSilverPrice };
