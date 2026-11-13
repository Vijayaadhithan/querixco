import { SAMPLE_PRODUCTS } from "./sample";
import type { Product } from "./model";

const products = (...ids: string[]): Product[] =>
  ids.map((id) => SAMPLE_PRODUCTS.find((product) => product.product_id === `sample:${id}`)!);

/** One illustrative catalog for search, conversation, and industry previews. */
export const DISCOVERY_EXAMPLES = {
  fashion: {
    label: "Fashion",
    query: "A cotton shirt for work under $40",
    budget: 40,
    refinedBudget: 30,
    preference: "Cotton",
    category: "Shirts",
    initial: products("f1", "f2"),
    refined: products("f2", "f3"),
    answer: "Here are two cotton shirts for work. Both fit your budget.",
    refinement: "Two options under $30. I’ve kept your cotton preference.",
    comparison: "Both are cotton. Here’s how their supplied details compare.",
    fields: [
      ["color", "Colour"],
      ["material", "Material"],
    ],
  },
  beauty: {
    label: "Beauty",
    query: "A fragrance-free moisturizer under $30",
    budget: 30,
    refinedBudget: 20,
    preference: "Fragrance-free",
    category: "Moisturizer",
    initial: products("m1", "m2"),
    refined: products("m4", "m5"),
    answer: "Here are two fragrance-free moisturizers within your budget.",
    refinement: "Two options under $20, with your fragrance-free preference kept.",
    comparison: "Let’s compare the sizes and skin types listed for these two.",
    fields: [
      ["skin_type", "Skin type"],
      ["volume", "Volume"],
    ],
  },
} as const;
export type DiscoveryExampleID = keyof typeof DISCOVERY_EXAMPLES;
