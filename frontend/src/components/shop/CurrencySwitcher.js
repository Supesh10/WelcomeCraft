import React from "react";
import { ChevronDown } from "lucide-react";
import { CURRENCIES, useCurrency } from "../../lib/currency";

// Currency picker for the navbar. A native <select> so it works with the
// keyboard, screen readers and phone pickers. Prices are stored in NPR;
// other currencies are converted with the day's rate.
export default function CurrencySwitcher({ id = "wc-currency", full = false, className = "" }) {
  const { selected, currency, available, status, setCurrency } = useCurrency();
  const loading = status === "loading";

  return (
    <label htmlFor={id} className={`wc-currency ${full ? "wc-currency-full" : ""} ${className}`}>
      <span className="sr-only">Currency</span>
      {full && <span className="wc-currency-label">Currency</span>}
      <span className="wc-currency-box">
        <span aria-hidden="true">{CURRENCIES[currency]?.flag}</span>
        <select
          id={id}
          value={selected}
          onChange={(e) => setCurrency(e.target.value)}
          title={selected !== currency && !loading ? `${selected} rates aren't available right now; showing ${currency}` : "Show prices in"}
        >
          {Object.values(CURRENCIES).map((c) => {
            const unavailable = !loading && !available.includes(c.code);
            return (
              <option key={c.code} value={c.code} disabled={unavailable}>
                {full ? `${c.code} · ${c.name}` : c.code}
                {unavailable ? " (unavailable)" : ""}
              </option>
            );
          })}
        </select>
        <ChevronDown size={14} aria-hidden="true" />
      </span>
    </label>
  );
}
