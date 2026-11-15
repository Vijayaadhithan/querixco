export type Product = {
  product_id: string;
  title: string;
  brand?: { value: string } | null;
  price: { amount: string | null; currency: string };
  image_urls?: string[];
  attributes: Record<string, { value: string | boolean | number | string[] } | null>;
  why_recommended?: string[];
  display_position?: number;
};
export type Task = {
  id: number;
  query: string;
  need?: string;
  filters: {
    max_price?: string | number | null;
    attributes?: Record<string, string | boolean>;
  };
};
type Preferences = { active_task_id?: number | null; tasks: Task[] };
export type Group = {
  task_id: number;
  query?: string;
  action: string;
  reply: string;
  products: Product[];
};
export type Commerce = {
  action: string;
  handoff?: {
    targets: {
      storefront_id: import("./storefronts").StorefrontID;
      label: string;
      href: string;
      message: string;
    }[];
  };
  reply?: string;
  preferences: Preferences;
  products: Product[];
  groups?: Group[];
  state_version?: number;
};
export type Message = {
  id: string | number;
  role: "user" | "assistant";
  content: string;
  commerce?: Commerce | null;
};
export type Conversation = {
  messages: Message[];
  preferences: Preferences;
  sessionId?: string;
  conversationId?: string;
};
export type CatalogSummary = {
  storefronts?: { id: string; label: string; families: string[]; product_count: number }[];
  product_count: number;
  indexed_product_count: number;
  categories: { domain: string; family: string; count: number }[];
  price_context: string;
};
export function attributeText(value: string | boolean | number | string[] | null | undefined) {
  if (value == null) return "Not specified";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return Array.isArray(value) ? value.join(", ") : String(value);
}
export const EMPTY_CONVERSATION: Conversation = {
  messages: [],
  preferences: { tasks: [] },
};
export const STARTERS = [
  {
    label: "A little care for dry skin",
    text: "A moisturizer for dry skin under $30",
    kind: "Beauty",
  },
  {
    label: "Two needs. One conversation.",
    text: "Shampoo under $15 and moisturizer under $25",
    kind: "Multi-product",
  },
  {
    label: "Find an everyday favorite",
    text: "A cotton shirt for adult men under $40",
    kind: "Fashion",
  },
];
export function productPrice(product: Product) {
  if (product.price.amount === null) return "Price not specified";
  const amount = Number(product.price.amount);
  if (!Number.isFinite(amount)) return "Price not specified";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: product.price.currency,
    }).format(amount);
  } catch {
    return "Price not specified";
  }
}
export function latestGroups(messages: Message[]): Group[] {
  const commerce = [...messages].reverse().find((message) => message.commerce)?.commerce;
  if (!commerce) return [];
  if (commerce.groups?.length) return commerce.groups;
  return [
    {
      task_id: commerce.preferences.active_task_id ?? 1,
      query: commerce.preferences.tasks.find(
        (task) => task.id === commerce.preferences.active_task_id,
      )?.query,
      action: commerce.action,
      reply: commerce.reply ?? "",
      products: commerce.products,
    },
  ];
}
