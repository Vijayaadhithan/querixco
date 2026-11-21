import { useState } from "react";
import { attributeText, productPrice, type Product, type Group } from "@/features/commerce/model";

export function Comparison({
  products,
  sample,
  onDetails,
  disabled,
}: {
  products: Product[];
  sample: boolean;
  onDetails?: (product: Product) => void;
  disabled: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const fields = [...new Set(products.flatMap((p) => Object.keys(p.attributes)))];
  const values = (field: string) =>
    products.map((p) => attributeText(p.attributes[field]?.value).trim() || "Not specified");
  const sizeFields = fields.filter(
    (f) => /(?:^|_)size(?:_|$)/i.test(f) && values(f).some((v) => v !== "Not specified"),
  );
  const differences = fields.filter(
    (f) => !sizeFields.includes(f) && new Set(values(f).map((v) => v.toLowerCase())).size > 1,
  );
  const other = fields.filter((f) => !sizeFields.includes(f) && !differences.includes(f));
  const visible = [...sizeFields, ...differences, ...(expanded ? other : [])];
  return (
    <div className="commerce-comparison" tabIndex={0} role="region" aria-label="Product comparison">
      <table>
        <caption>Compare supplied listing details</caption>
        <thead>
          <tr>
            <th>Attribute</th>
            {products.map((product) => (
              <th key={product.product_id} scope="col">
                <span>{product.title}</span>
                {onDetails && (
                  <button
                    type="button"
                    className="comparison-listing-link"
                    disabled={disabled}
                    aria-label={`View ${product.title}`}
                    onClick={() => onDetails(product)}
                  >
                    Listing details
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>{sample ? "Sample" : "Historical"} price</th>
            {products.map((product) => (
              <td key={product.product_id}>{productPrice(product)}</td>
            ))}
          </tr>
          {visible.map((field) => (
            <tr key={field}>
              <th>{field.replaceAll("_", " ")}</th>
              {products.map((product) => (
                <td key={product.product_id}>
                  {attributeText(product.attributes[field]?.value).trim() || "Not specified"}
                </td>
              ))}
            </tr>
          ))}
          {expanded && (
            <tr>
              <th>Current stock</th>
              {products.map((product) => (
                <td key={product.product_id}>Not verified</td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
      <button
        type="button"
        className="comparison-disclosure"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Hide additional details" : "Show shared and unreported details"}
      </button>
    </div>
  );
}
export function ComparePicker({
  products,
  group,
  disabled,
  onSend,
}: {
  products: Product[];
  group: Group;
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<string[]>([]);
  if (products.length < 2) return null;
  const submit = (ids: string[]) => {
    const positions = ids.map((id) => products.findIndex((p) => p.product_id === id) + 1);
    onSend(
      `Compare option ${positions[0]} and option ${positions[1]} in task ${group.task_id} (referring to ${ids.join(" and ")} in task ${group.task_id})`,
    );
    setOpen(false);
    setChosen([]);
  };
  if (products.length === 2 && group.action !== "compare")
    return (
      <button disabled={disabled} onClick={() => submit(products.map((p) => p.product_id))}>
        Compare both products
      </button>
    );
  if (products.length === 2 && group.action === "compare") return null;
  return (
    <div className="chat-compare-picker">
      <button aria-expanded={open} disabled={disabled} onClick={() => setOpen(!open)}>
        {group.action === "compare" ? "Choose different products" : "Choose products to compare"}
      </button>
      {open && (
        <fieldset disabled={disabled}>
          <legend>Choose two products</legend>
          {products.map((p) => {
            const selected = chosen.includes(p.product_id);
            return (
              <label key={p.product_id}>
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={!selected && chosen.length >= 2}
                  onChange={() =>
                    setChosen(
                      selected
                        ? chosen.filter((id) => id !== p.product_id)
                        : [...chosen, p.product_id],
                    )
                  }
                />
                {p.title} · {productPrice(p)}
              </label>
            );
          })}
          <button disabled={chosen.length !== 2} onClick={() => submit(chosen)}>
            Compare selected products
          </button>
        </fieldset>
      )}
    </div>
  );
}
