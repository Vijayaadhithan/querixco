import {
  DISCOVERY_EXAMPLES,
  type DiscoveryExampleID,
} from "@/features/commerce/discovery-examples";
import type { Product } from "@/features/commerce/model";

export type GuidedAction = "budget" | "preference" | "compare";
type GuidedTurn = {
  prompt: string;
  reply: string;
  products: readonly Product[];
  budget: number;
  preference: string | null;
  comparison: boolean;
};
export type GuidedConversation = {
  scenario: DiscoveryExampleID;
  narrowed: boolean;
  preferred: boolean;
  turns: GuidedTurn[];
};

export function startConversation(scenario: DiscoveryExampleID): GuidedConversation {
  const example = DISCOVERY_EXAMPLES[scenario];
  return {
    scenario,
    narrowed: false,
    preferred: false,
    turns: [
      {
        prompt: example.query,
        reply: example.answer,
        products: example.initial,
        budget: example.budget,
        preference: null,
        comparison: false,
      },
    ],
  };
}

export function choiceLabel(action: GuidedAction, scenario: DiscoveryExampleID) {
  if (action === "budget") return `Keep it under $${DISCOVERY_EXAMPLES[scenario].refinedBudget}`;
  if (action === "preference") return scenario === "fashion" ? "Show blue shirts" : "50 ml or more";
  return "Compare these two";
}

/** Each branch keeps the accumulated constraints and compares the actual visible results. */
export function advanceConversation(
  state: GuidedConversation,
  action: GuidedAction,
): GuidedConversation {
  const example = DISCOVERY_EXAMPLES[state.scenario];
  const previous = state.turns.at(-1)!;
  if (
    (action === "budget" && state.narrowed) ||
    (action === "preference" && state.preferred) ||
    (action === "compare" && (previous.comparison || previous.products.length < 2))
  )
    return state;
  const narrowed = state.narrowed || action === "budget";
  const preferred = state.preferred || action === "preference";
  const budget = narrowed ? example.refinedBudget : example.budget;
  const preference = preferred ? (state.scenario === "fashion" ? "Blue" : "50 ml or more") : null;
  const catalog = [
    ...new Map([...example.initial, ...example.refined].map((p) => [p.product_id, p])).values(),
  ];
  const products =
    action === "compare"
      ? previous.products
      : preferred
        ? catalog
            .filter(
              (p) =>
                Number(p.price?.amount) <= budget &&
                (state.scenario === "fashion"
                  ? p.attributes.color?.value === "blue"
                  : parseInt(String(p.attributes.volume?.value), 10) >= 50),
            )
            .slice(0, 2)
        : narrowed
          ? example.refined
          : example.initial;
  const reply =
    action === "compare"
      ? example.comparison
      : action === "budget" && !preferred
        ? example.refinement
        : state.scenario === "fashion"
          ? `${products.length === 1 ? "One blue shirt" : "Two blue shirts"} under $${budget}. Your cotton preference stays.`
          : `${products.length === 1 ? "One option" : "Two options"} with at least 50 ml, under $${budget}. Still fragrance-free.`;
  return {
    scenario: state.scenario,
    narrowed,
    preferred,
    turns: [
      ...state.turns,
      {
        prompt: choiceLabel(action, state.scenario),
        reply,
        products,
        budget,
        preference,
        comparison: action === "compare",
      },
    ],
  };
}
