const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeGoldPrice() {
  try {
    const { data: html } = await axios.get(process.env.GOLD_PRICE_API_URL);
    const $ = cheerio.load(html);

    const li = $(
      "li[onclick=\"$('.goldchart').hide();$('#goldchart').show();\"]"
    );
    if (!li.length) {
      throw new Error("gold price element not found on hamropatro.com");
    }

    const text = li.text().trim();
    const match = text.match(/([\d,]+\.\d+)/);
    if (!match) {
      throw new Error(`Price not found in text: ${text}`);
    }

    const price = parseFloat(match[1].replace(/,/g, ""));
    if (isNaN(price)) {
      throw new Error(`Parsed price is invalid: ${match[1]}`);
    }

    const scrapedAt = new Date();
    console.log(`✅ Scraped gold price: Nrs. ${price}`);
    return { price, scrapedAt };
  } catch (err) {
    console.error("❌ Error scraping gold price:", err.message);
    throw err;
  }
}

module.exports = { scrapeGoldPrice };
