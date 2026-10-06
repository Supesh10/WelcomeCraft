import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

// "+20" / "-15" / "0" -> { text, direction }
function describeChange(change) {
  const text = change == null ? "" : String(change).trim();
  if (text.startsWith("+")) return { text, direction: "up" };
  if (text.startsWith("-")) return { text, direction: "down" };
  return { text: text && text !== "0" ? `~${text}` : "No change", direction: "flat" };
}

// Today's silver or gold rate per tola, for dark backgrounds
export default function LivePriceCard({ label, price }) {
  const change = describeChange(price.dailyChange);
  const Icon = change.direction === "down" ? TrendingDown : TrendingUp;
  return (
    <div className="wc-price-card">
      <div className="wc-price-label">{label}</div>
      <div className="flex items-baseline justify-between gap-3 mt-1">
        <div className="wc-price-value">
          Rs. {price.pricePerTola?.toLocaleString()}
          <span className="text-xs font-normal ml-1" style={{ fontFamily: "var(--wc-font-sans)" }}>
            / tola
          </span>
        </div>
        <span
          className={`flex items-center gap-1 text-sm font-semibold ${
            change.direction === "up" ? "wc-change-up" : change.direction === "down" ? "wc-change-down" : ""
          }`}
        >
          {change.direction !== "flat" && <Icon size={14} />}
          {change.text}
        </span>
      </div>
      {price.lastScrapedAt && (
        <p className="text-xs mt-1" style={{ color: "var(--wc-on-dark-muted)" }}>
          Updated {new Date(price.lastScrapedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
