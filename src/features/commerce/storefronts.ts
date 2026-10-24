export const STOREFRONTS = {
  clothing: {
    label: "Clothing",
    families: ["apparel"],
    welcome: "Find your next everyday favorite",
    prompts: ["A cotton shirt for men under $40", "A jacket under $60", "A summer dress under $45"],
  },
  beauty: {
    label: "Beauty & personal care",
    families: [
      "skin_care",
      "hair_care",
      "makeup",
      "fragrance",
      "oral_care",
      "shaving",
      "beauty_tools",
      "personal_care",
    ],
    welcome: "A little care, chosen for you",
    prompts: [
      "Hair fall need a shampoo and dandruf under 30$",
      "A moisturizer for dry skin under $30",
      "Shampoo under $15 and moisturizer under $25",
    ],
  },
  footwear: {
    label: "Footwear",
    families: ["footwear"],
    welcome: "Find your next pair",
    prompts: ["Running shoes under $60", "Sandals for women under $40", "Black boots under $80"],
  },
  fashion: {
    label: "Fashion accessories",
    families: ["bags", "jewelry", "watches", "accessories"],
    welcome: "Find the finishing touch",
    prompts: ["A crossbody bag under $40", "A necklace under $25", "A watch under $70"],
  },
} as const;
export type StorefrontID = keyof typeof STOREFRONTS;
export function isStorefront(value: unknown): value is StorefrontID {
  return typeof value === "string" && Object.hasOwn(STOREFRONTS, value);
}
export function commerceURL(path: string, storefront?: StorefrontID) {
  return `/api/commerce/${path}${storefront ? `${path.includes("?") ? "&" : "?"}storefront=${storefront}` : ""}`;
}
