import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useCurrency } from "../../lib/currency";

// "+20" / "-15" / "0" (NPR) -> { text, direction }, the amount in the shown currency
function describeChange(change, format) {
  const text = change == null ? "" : String(change).trim();
  const amount = Number(text.replace(/[^\d.]/g, ""));
  const shown = amount > 0 ? format(amount) : text.replace(/^[+-]/, "");
  if (text.startsWith("+")) return { text: `+${shown}`, direction: "up" };
  if (text.startsWith("-")) return { text: `-${shown}`, direction: "down" };
  return { text: text && text !== "0" ? `~${shown}` : "No change", direction: "flat" };
}

// Today's silver or gold rate per tola, for dark backgrounds
export default function LivePriceCard({ label, price }) {
  const { format } = useCurrency();
  const change = describeChange(price.dailyChange, format);
  const Icon = change.direction === "down" ? TrendingDown : TrendingUp;
  return (
    <div className="wc-price-card">
      <div className="wc-price-label">{label}</div>
      <div className="flex items-baseline justify-between gap-3 mt-1">
        <div className="wc-price-value">
          {format(price.pricePerTola)}
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
