import {
  EMPTY_CONVERSATION,
  type Commerce,
  type Conversation,
  type Group,
  type Product,
  type Task,
} from "./model";

type Kind = "moisturizer" | "shampoo" | "shirt";
const SAMPLE_PHOTOS: Record<string, string> = {
  f1: "navy-shirt",
  f2: "sand-shirt",
  f3: "blue-shirt",
  m1: "daily-cream",
  m2: "cloud-moisturizer",
  m4: "quiet-cream",
  m5: "daily-lotion",
};
const rows: [string, string, string, Kind, number, string, Record<string, string | boolean>][] = [
  [
    "m1",
    "Daily comfort cream",
    "FIELDNOTE",
    "moisturizer",
    24,
    "cream",
    { skin_type: "dry", fragrance_free: true, volume: "50 ml" },
  ],
  [
    "m2",
    "Cloud-soft moisturizer",
    "SUNDAY STUDIO",
    "moisturizer",
    18,
    "jar",
    { skin_type: "dry", fragrance_free: true, volume: "60 ml" },
  ],
  [
    "m3",
    "Everyday hydration",
    "COMMON GROUND",
    "moisturizer",
    12,
    "tube",
    { skin_type: "dry", fragrance_free: false, volume: "75 ml" },
  ],
  [
    "m4",
    "Quiet morning cream",
    "FIELDNOTE",
    "moisturizer",
    16,
    "quiet-cream",
    { skin_type: "dry", fragrance_free: true, volume: "40 ml" },
  ],
  [
    "m5",
    "Simple daily lotion",
    "COMMON GROUND",
    "moisturizer",
    9,
    "simple-lotion",
    { skin_type: "dry", fragrance_free: true, volume: "30 ml" },
  ],
  [
    "s1",
    "The daily shampoo",
    "FIELDNOTE",
    "shampoo",
    14,
    "shampoo",
    { fragrance_free: true, volume: "250 ml" },
  ],
  [
    "s2",
    "Fresh start wash",
    "SUNDAY STUDIO",
    "shampoo",
    11,
    "bottle",
    { fragrance_free: false, volume: "200 ml" },
  ],
  [
    "s3",
    "Simply clean shampoo",
    "COMMON GROUND",
    "shampoo",
    8,
    "clean-shampoo",
    { fragrance_free: true, volume: "150 ml" },
  ],
  [
    "f1",
    "The everyday navy shirt",
    "COMMON GROUND",
    "shirt",
    36,
    "shirt",
    { material: "cotton", department: "adult men", color: "blue" },
  ],
  [
    "f2",
    "Weekend cotton shirt",
    "SUNDAY STUDIO",
    "shirt",
    29,
    "shirt-sand",
    { material: "cotton", department: "adult men", color: "sand" },
  ],
  [
    "f3",
    "Easy blue button-down",
    "FIELDNOTE",
    "shirt",
    22,
    "shirt",
    { material: "cotton", department: "adult men", color: "blue" },
  ],
];
export const SAMPLE_PRODUCTS: Product[] = rows.map(
  ([id, title, brand, , price, art, attributes]) => ({
    product_id: `sample:${id}`,
    title,
    brand: { value: brand },
    price: { amount: price.toFixed(2), currency: "USD" },
    image_urls: [
      id in SAMPLE_PHOTOS ? `/commerce/photos/${SAMPLE_PHOTOS[id]}.webp` : `/commerce/${art}.svg`,
    ],
    attributes: Object.fromEntries(
      Object.entries(attributes).map(([key, value]) => [key, { value }]),
    ),
    why_recommended: ["Illustrative product from the sample catalog."],
  }),
);
function kindOf(product: Product) {
  return rows.find(([id]) => product.product_id === `sample:${id}`)?.[3];
}
function reply(
  state: Conversation,
  text: string,
  content: string,
  commerce: Commerce,
): Conversation {
  return {
    preferences: commerce.preferences,
    messages: [
      ...state.messages,
      { id: crypto.randomUUID(), role: "user", content: text },
      { id: crypto.randomUUID(), role: "assistant", content, commerce },
    ],
  };
}
export function sampleTurn(previous: Conversation, text: string): Conversation {
  const state: Conversation = JSON.parse(JSON.stringify(previous));
  const lower = text.toLowerCase();
  const preferences = state.preferences;
  const clarify = (content: string) =>
    reply(previous, text, content, {
      action: "clarify",
      products: [],
      preferences: previous.preferences,
    });
  if (/start over|reset requirements/.test(lower))
    return reply(EMPTY_CONVERSATION, text, "A fresh start. What are you shopping for?", {
      action: "reset",
      products: [],
      preferences: { tasks: [] },
    });
  if (/₹|€|£|\b(?:inr|eur|gbp|rupees)\b/.test(lower))
    return clarify(
      "The sample catalog uses USD. Please give your budget in dollars; I won’t convert or reinterpret it.",
    );
  if (/chemical|organic|allerg|acne|pimple|cure|safe for/.test(lower))
    return clarify(
      "These sample listings cannot establish that claim. Try the supported fragrance-free preference, or use live mode for a fuller clarification conversation.",
    );
  const explicit = [...lower.matchAll(/\b(moisturi[sz]er|shampoo|shirt)\b/g)].map((match) => ({
    kind: match[1].replace("moisturiser", "moisturizer") as Kind,
    at: match.index!,
  }));
  const namedTask = lower.match(/task\s+(\d+)/)?.[1];
  let active =
    preferences.tasks.find((task) => task.id === Number(namedTask)) ??
    preferences.tasks.find((task) => task.id === preferences.active_task_id);
  if (namedTask && !preferences.tasks.some((task) => task.id === Number(namedTask)))
    return clarify("That shopping task does not exist yet. Choose one of the displayed tasks.");
  if (/compare|details/.test(lower)) {
    if (!active)
      return clarify("Find a few products first, then choose Compare or Details on the results.");
    if (!namedTask && preferences.tasks.length > 1 && !explicit.length)
      return clarify(
        "Which shopping task should I use? Choose Compare on the relevant product group.",
      );
    if (explicit.length)
      active = preferences.tasks.find((task) => task.query === explicit[0].kind) ?? active;
    const groups = state.messages
      .flatMap((message) => message.commerce?.groups ?? [])
      .filter((group) => group.task_id === active!.id && group.products.length);
    const last = groups.at(-1);
    if (!last) return clarify("There are no displayed products for this task yet.");
    const position = lower.match(/details.*?(\d+)/)?.[1];
    const products = /compare/.test(lower)
      ? last.products.slice(0, 2)
      : last.products.filter((product) => product.display_position === Number(position ?? 1));
    const action = /compare/.test(lower) ? "compare" : "details";
    const content =
      action === "compare"
        ? "Here are the sample listings side by side. Unspecified attributes stay unknown."
        : "Here are the attributes supplied by this sample listing.";
    const group = { ...last, products, action, reply: content };
    return reply(state, text, content, { action, preferences, products, groups: [group] });
  }
  if (explicit.length > 1 && /\bboth\b|combined|total budget/.test(lower))
    return clarify(
      "Please specify a separate budget or preference for each product, for example shampoo under $15 and moisturizer under $25.",
    );
  if (!explicit.length && preferences.tasks.length > 1 && !namedTask)
    return clarify(
      "Which product should I update? Say “moisturizer under $20” or use the actions on its product group.",
    );
  if (!explicit.length && !active)
    return clarify(
      "This is a scripted sample, with moisturizers, shampoo, and cotton shirts. Choose an example to explore the shopping flow. Live mode uses your connected commerce backend.",
    );
  if (!explicit.length && !/under|below|fragrance.free|more|cheaper|task/.test(lower))
    return clarify(
      "This sample supports budgets, fragrance-free, more options, details, and comparisons. Try “under $20 instead”, or switch to live mode for open-ended chat.",
    );
  const targets: Task[] = [];
  if (explicit.length) {
    for (let index = 0; index < explicit.length; index++) {
      const mention = explicit[index];
      const clause = lower.slice(mention.at, explicit[index + 1]?.at ?? lower.length);
      let task = preferences.tasks.find((item) => item.query === mention.kind);
      if (!task) {
        task = {
          id: preferences.tasks.length + 1,
          query: mention.kind,
          filters: { attributes: {} },
        };
        preferences.tasks.push(task);
      }
      const budget = clause.match(/(?:under|below)\s*\$?\s*(\d+(?:\.\d{1,2})?)/);
      if (budget) task.filters.max_price = (Number(budget[1]) - 0.01).toFixed(2);
      targets.push(task);
    }
  } else if (active) targets.push(active);
  if (targets.length === 1) {
    const budget = lower.match(/(?:under|below)\s*\$?\s*(\d+(?:\.\d{1,2})?)/);
    if (budget) targets[0].filters.max_price = (Number(budget[1]) - 0.01).toFixed(2);
  }
  const groups: Group[] = [];
  for (const task of targets) {
    const source =
      targets.length === 1
        ? lower
        : lower.slice(
            explicit.find((item) => item.kind === task.query)!.at,
            explicit.find(
              (item) => item.at > explicit.find((entry) => entry.kind === task.query)!.at,
            )?.at ?? lower.length,
          );
    if (source.includes("dry skin")) task.need = "dry skin";
    if (/fragrance.free/.test(source))
      task.filters.attributes = { ...task.filters.attributes, fragrance_free: true };
    const seen = state.messages.flatMap(
      (message) =>
        message.commerce?.groups
          ?.filter((group) => group.task_id === task.id)
          .flatMap((group) => group.products) ?? [],
    );
    if (/cheaper/.test(source) && seen.length)
      task.filters.max_price = Math.min(
        Number(task.filters.max_price ?? Infinity),
        Math.min(...seen.map((product) => Number(product.price.amount))) - 0.01,
      ).toFixed(2);
    let products = SAMPLE_PRODUCTS.filter(
      (product) =>
        kindOf(product) === task.query &&
        Number(product.price.amount) <= Number(task.filters.max_price ?? Infinity) &&
        (!task.filters.attributes?.fragrance_free ||
          product.attributes.fragrance_free?.value === true),
    );
    if (/more/.test(source))
      products = products.filter(
        (product) => !seen.some((old) => old.product_id === product.product_id),
      );
    products = products.slice(0, 3).map((product, index) => ({
      ...product,
      display_position: index + 1,
      why_recommended: [
        task.filters.max_price
          ? `Within your $${Number(task.filters.max_price).toFixed(2)} maximum.`
          : "Matches your sample product category.",
        ...(task.filters.attributes?.fragrance_free
          ? ["Marked fragrance-free in the fictional listing."]
          : []),
      ],
    }));
    groups.push({
      task_id: task.id,
      query: task.query,
      action: "recommend",
      products,
      reply: products.length
        ? `Sample ${task.query} options for your requirements.`
        : "No sample products match. Your requirements are unchanged; try a different budget or start a new conversation.",
    });
  }
  preferences.active_task_id = targets.at(-1)?.id;
  const content =
    groups.length > 1
      ? "Two shopping needs, kept separate. Each group has its own budget and follow-up actions."
      : groups[0].products.length
        ? "Here are a few sample options. You can refine the budget, compare them, or ask for more."
        : groups[0].reply;
  return reply(state, text, content, {
    action: groups.length > 1 ? "multi" : "recommend",
    products: groups.flatMap((group) => group.products),
    preferences,
    groups,
  });
}
