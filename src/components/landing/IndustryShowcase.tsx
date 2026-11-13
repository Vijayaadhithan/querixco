import { useId, useState } from "react";
import { ArrowRight, Check, Cpu, FlaskConical, House, Shirt, Wrench } from "lucide-react";
import { DISCOVERY_EXAMPLES } from "@/features/commerce/discovery-examples";
import { attributeText, productPrice } from "@/features/commerce/model";

const industries = [
  {
    name: "Fashion",
    icon: Shirt,
    title: "The right fit starts with understanding.",
    body: "Connect fabric, colour, occasion and budget to the products in your catalogue.",
    query: "A cotton shirt for work under $40",
    followup: "Keep it under $30",
    tags: ["Cotton", "Workwear", "Under $40"],
    refinedTags: ["Cotton", "Workwear", "Under $30"],
    products: ["The everyday Oxford", "Weekend cotton shirt"],
    refinedProducts: ["Easy blue button-down", "Weekend cotton shirt"],
    prices: ["$36", "$29"],
    refinedPrices: ["$22", "$29"],
    details: ["Blue · Cotton", "Sand · Cotton"],
    art: "fashion",
  },
  {
    name: "Electronics",
    icon: Cpu,
    title: "Less spec hunting. More useful choices.",
    body: "Help shoppers describe how they will use a product, then refine by the specifications that matter.",
    query: "Wireless headphones for a long commute",
    followup: "Only show noise-cancelling options",
    tags: ["Wireless", "Commuting"],
    refinedTags: ["Wireless", "Commuting", "Noise cancelling"],
    products: ["Everyday wireless", "Studio wireless"],
    refinedProducts: ["Quiet commute ANC", "Studio wireless ANC"],
    prices: ["$59", "$89"],
    refinedPrices: ["$79", "$99"],
    details: ["Over-ear · Wireless", "Over-ear · Wireless"],
    art: "electronics",
  },
  {
    name: "Automotive",
    icon: Wrench,
    title: "Make the requirements part of discovery.",
    body: "Bring vehicle details and supplied part specifications into the conversation. Confirm fitment against your catalogue data.",
    query: "Replacement brake pads for my car",
    followup: "My car is a 2020 hatchback",
    tags: ["Brake pads", "Fitment needed"],
    refinedTags: ["Brake pads", "2020 hatchback", "Verify fitment"],
    products: ["Everyday brake pads", "Touring brake pads"],
    refinedProducts: ["Everyday brake pad set", "Touring brake pad set"],
    prices: ["$39", "$59"],
    refinedPrices: ["$39", "$59"],
    details: ["Front axle · Example", "Front axle · Example"],
    art: "automotive",
  },
  {
    name: "Beauty",
    icon: FlaskConical,
    title: "A little care, chosen with context.",
    body: "Guide discovery through preferences, routines and the attributes explicitly supplied in each product listing.",
    query: "A fragrance-free moisturizer under $30",
    followup: "Something under $20 instead",
    tags: ["Moisturizer", "Fragrance-free", "Under $30"],
    refinedTags: ["Moisturizer", "Fragrance-free", "Under $20"],
    products: ["Daily comfort cream", "Cloud-soft moisturizer"],
    refinedProducts: ["Quiet morning cream", "Simple daily lotion"],
    prices: ["$24", "$18"],
    refinedPrices: ["$16", "$9"],
    details: ["Fragrance-free · Dry skin", "Fragrance-free · Dry skin"],
    art: "beauty",
  },
  {
    name: "Home & more",
    icon: House,
    title: "Different catalogues. The same conversation.",
    body: "Explore how dimensions, materials and intended use can help customers navigate furniture and other product-rich catalogues.",
    query: "A sofa for a small apartment",
    followup: "Keep the width under 180 cm",
    tags: ["Sofa", "Small spaces"],
    refinedTags: ["Sofa", "Width < 180 cm"],
    products: ["Everyday two-seater", "Compact lounge sofa"],
    refinedProducts: ["Apartment two-seater", "Compact lounge sofa"],
    prices: ["$449", "$599"],
    refinedPrices: ["$449", "$599"],
    details: ["Fabric · Two seats", "Fabric · Two seats"],
    art: "home",
  },
] as const;

function IndustryArt({ kind, second = false }: { kind: string; second?: boolean }) {
  if (kind === "fashion" || kind === "beauty")
    return (
      <img
        src={`/commerce/${kind === "fashion" ? (second ? "shirt-sand" : "shirt") : second ? "jar" : "quiet-cream"}.svg`}
        alt=""
        width="280"
        height="280"
        loading="lazy"
      />
    );
  const colour = second ? "#54708f" : "#253d59";
  return (
    <svg viewBox="0 0 280 240" fill="none" aria-hidden="true">
      <ellipse cx="140" cy="211" rx="74" ry="9" fill="#122239" opacity=".08" />
      {kind === "electronics" ? (
        <>
          <path d="M76 135V98a64 64 0 0 1 128 0v37" stroke="#8eabc6" strokeWidth="19" />
          <path d="M76 135V98a64 64 0 0 1 128 0v37" stroke={colour} strokeWidth="12" />
          <rect x="58" y="105" width="40" height="89" rx="18" fill={colour} />
          <rect x="182" y="105" width="40" height="89" rx="18" fill={colour} />
          <rect x="83" y="113" width="22" height="75" rx="11" fill="#8eabc6" />
          <rect x="175" y="113" width="22" height="75" rx="11" fill="#8eabc6" />
          <path
            d="M67 118v55m126-55v55"
            stroke="#ffffff"
            strokeOpacity=".2"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ) : kind === "automotive" ? (
        <>
          <path
            d="M65 89q75-61 150 0l-18 74q-57-31-114 0z"
            fill={colour}
            stroke="#829ab1"
            strokeWidth="4"
          />
          <path d="M83 96q57-39 114 0l-8 40q-49-21-98 0z" fill="#8195a8" />
          <path d="M108 85l11 50m36-55-1 48m33-36-12 41" stroke={colour} strokeWidth="5" />
          <circle cx="82" cy="155" r="8" fill="#bdc9d4" />
          <circle cx="198" cy="155" r="8" fill="#bdc9d4" />
          <path d="M92 172h95v17H92z" fill="#8eabc6" />
        </>
      ) : (
        <>
          <rect x="53" y="70" width="174" height="103" rx="21" fill={colour} />
          <rect x="67" y="85" width="70" height="71" rx="12" fill="#8eabc6" />
          <rect x="143" y="85" width="70" height="71" rx="12" fill="#8eabc6" />
          <rect x="51" y="143" width="178" height="48" rx="12" fill="#6c89a6" />
          <rect x="33" y="128" width="29" height="62" rx="10" fill={colour} />
          <rect x="218" y="128" width="29" height="62" rx="10" fill={colour} />
          <path d="M59 190v17m162-17v17" stroke="#253d59" strokeWidth="8" />
          <path d="M65 165h150" stroke="#bed0df" strokeOpacity=".4" />
        </>
      )}
    </svg>
  );
}

export function IndustryShowcase() {
  const [index, setIndex] = useState(0);
  const [refined, setRefined] = useState(false);
  const id = useId();
  const item = industries[index];
  const catalogExample =
    item.art === "fashion"
      ? DISCOVERY_EXAMPLES.fashion
      : item.art === "beauty"
        ? DISCOVERY_EXAMPLES.beauty
        : null;
  const catalogProducts = catalogExample
    ? refined
      ? catalogExample.refined
      : catalogExample.initial
    : null;
  return (
    <div className="ql-industries">
      <div className="ql-industry-tabs" role="group" aria-label="Industry demonstrations">
        {industries.map(({ name, icon: Icon }, i) => (
          <button
            key={name}
            aria-pressed={i === index}
            aria-controls={id}
            onClick={() => {
              setIndex(i);
              setRefined(false);
            }}
          >
            <Icon size={17} />
            {name}
          </button>
        ))}
      </div>
      <div className="ql-industry-panel" id={id}>
        <div className="ql-industry-copy">
          <span className="ql-section-index">
            {String(index + 1).padStart(2, "0")} / {item.name.toUpperCase()}
          </span>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
          <a className="qx-text-link" href={`/request-demo?product=commerce&intent=poc`}>
            Explore your catalogue <ArrowRight size={15} />
          </a>
          <span className="ql-industry-disclosure">Illustrative industry scenario</span>
        </div>
        <div className="ql-industry-demo">
          <div className="ql-industry-query">
            <span>SHOPPER</span>
            <p>“{item.query}”</p>
          </div>
          <div className="ql-filter-chips">
            {(refined ? item.refinedTags : item.tags).map((tag) => (
              <span key={tag}>
                <Check size={11} />
                {tag}
              </span>
            ))}
          </div>
          <div className="ql-industry-products">
            {(refined ? item.refinedProducts : item.products).map((product, i) => (
              <article key={product}>
                {catalogProducts ? (
                  <img
                    src={catalogProducts[i].image_urls?.[0]}
                    alt={catalogProducts[i].title}
                    width="280"
                    height="280"
                    loading="lazy"
                  />
                ) : (
                  <IndustryArt kind={item.art} second={i === 1} />
                )}
                <div>
                  <h4>{catalogProducts?.[i].title ?? product}</h4>
                  <p>
                    {catalogProducts
                      ? attributeText(
                          catalogProducts[i].attributes[
                            catalogExample === DISCOVERY_EXAMPLES.fashion ? "material" : "volume"
                          ]?.value,
                        )
                      : item.details[i]}
                  </p>
                  <strong>
                    {catalogProducts
                      ? productPrice(catalogProducts[i])
                      : (refined ? item.refinedPrices : item.prices)[i]}
                  </strong>
                </div>
              </article>
            ))}
          </div>
          <button
            className="ql-industry-refine"
            aria-pressed={refined}
            onClick={() => setRefined(!refined)}
          >
            {refined ? (
              <>
                <Check size={15} />
                Refinement applied <span>Reset</span>
              </>
            ) : (
              <>
                {item.followup}
                <ArrowRight size={15} />
              </>
            )}
          </button>
          <span className="qx-sr-only" role="status">
            {item.name} scenario. {refined ? "Refined" : "Initial"} product examples displayed.
          </span>
        </div>
      </div>
    </div>
  );
}
