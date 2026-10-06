import React from "react";
import { Link } from "react-router-dom";
import { Eye, ShoppingCart } from "lucide-react";
import {
  fallbackToPlaceholder,
  isCustomSilver,
  isSilver,
  priceLabel,
  productImage,
  variantLabel,
} from "../../lib/productDisplay";

/**
 * Product card in the prototype's style: photo on top (or on the left with
 * layout="row"), marigold or crimson body with meta, title and price.
 */
export default function ProductTile({ product, onAddToCart, crimson = false, layout = "grid" }) {
  const url = `/product/${product._id}`;
  const custom = isCustomSilver(product);
  const row = layout === "row";

  return (
    <article className={`wc-product-card group ${crimson ? "wc-crimson" : ""} ${row ? "wc-row" : ""}`}>
      <div className="wc-product-photo">
        <Link to={url} tabIndex={-1} aria-hidden="true">
          <img src={productImage(product)} onError={fallbackToPlaceholder} alt="" />
        </Link>
        {isSilver(product) && <span className="wc-tag">{custom ? "Made to order" : "Live price"}</span>}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Link to={url} className="wc-icon-btn" aria-label={`View ${product.title}`}>
            <Eye size={16} />
          </Link>
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="wc-icon-btn"
            aria-label={custom ? `Customize ${product.title}` : `Add ${product.title} to cart`}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1 min-w-0">
        <p className="wc-product-meta truncate">{[product.category?.name, variantLabel(product)].filter(Boolean).join(" · ")}</p>
        <h3 className="text-lg leading-snug mt-1 mb-3">
          <Link to={url} className="hover:underline">
            {product.title}
          </Link>
        </h3>
        {row && product.description && <p className="wc-product-desc text-sm mb-4 line-clamp-2">{product.description}</p>}
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="wc-product-price">{priceLabel(product)}</span>
          {row ? (
            <button type="button" onClick={() => onAddToCart(product)} className="wc-btn wc-btn-primary wc-btn-sm">
              {custom ? "Customize" : "Add to cart"}
            </button>
          ) : (
            <Link to={url} className="wc-product-link">
              Details ›
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
