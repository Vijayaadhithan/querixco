import { useState } from "react";
import { ArrowUpRight, Check, ImageOff } from "lucide-react";
import { attributeText, productPrice, type Product } from "@/features/commerce/model";
export function ProductCard({
  product,
  sample = false,
  details = false,
  onDetails,
  disabled,
}: {
  product: Product;
  sample?: boolean;
  details?: boolean;
  onDetails?: () => void;
  disabled?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const candidate = product.image_urls?.[0];
  const image =
    candidate &&
    (/^https:\/\//.test(candidate) ||
      (sample && /^\/commerce\/(?:[a-z-]+\.svg|photos\/[a-z-]+\.webp)$/.test(candidate)))
      ? candidate
      : undefined;
  return (
    <article className="commerce-product">
      <div className={`commerce-product-image${image?.endsWith(".webp") ? " has-photo" : ""}`}>
        {image && !failed ? (
          <img
            src={image}
            alt={product.title}
            width={640}
            height={640}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="commerce-image-fallback">
            <ImageOff size={24} />
            <span>Image unavailable</span>
          </div>
        )}
        <span className="commerce-product-number">
          {String(product.display_position ?? 1).padStart(2, "0")}
        </span>
        {sample && <span className="commerce-image-label">Sample product</span>}
      </div>
      <div className="commerce-product-body">
        <p className="commerce-brand">{product.brand?.value || "Brand not specified"}</p>
        <h3>{product.title}</h3>
        <div className="commerce-price">
          {productPrice(product)}
          <span>{sample ? "Sample price · USD" : "Historical price"}</span>
        </div>
        <div className="commerce-reasons">
          {(product.why_recommended ?? []).slice(0, details ? undefined : 2).map((reason) => (
            <p key={reason}>
              <Check size={13} />
              <span>{reason}</span>
            </p>
          ))}
        </div>
        {details && (
          <dl className="commerce-attributes">
            {Object.entries(product.attributes)
              .filter(([, claim]) => claim !== null)
              .map(([name, claim]) => (
                <div key={name}>
                  <dt>{name.replaceAll("_", " ")}</dt>
                  <dd>{attributeText(claim!.value)}</dd>
                </div>
              ))}
            <div>
              <dt>Availability</dt>
              <dd>Not verified</dd>
            </div>
          </dl>
        )}
        {onDetails && (
          <button
            className="commerce-card-action"
            onClick={onDetails}
            disabled={disabled}
            aria-label={`View ${product.title}`}
          >
            {sample ? "View details" : "View listing details"} <ArrowUpRight size={15} />
          </button>
        )}
      </div>
    </article>
  );
}
